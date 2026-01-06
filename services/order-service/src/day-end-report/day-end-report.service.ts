import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession, Types } from 'mongoose';
import {
  DayEndReport,
  DayEndReportDocument,
} from './schemas/day-end-report.schema';
import {
  PosSession,
  PosSessionDocument,
} from '../pos-session/schemas/pos-session.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Payment, PaymentDocument } from '../orders/schemas/payment.schema';
import { OrderItem, OrderItemDocument } from '../orders/schemas/order-item.schema';
import { GenerateZReportDto } from './dto/generate-z-report.dto';
import { XReportResponseDto } from './dto/x-report-response.dto';
import { ZReportResponseDto } from './dto/z-report-response.dto';

@Injectable()
export class DayEndReportService {
  constructor(
    @InjectModel(DayEndReport.name)
    private dayEndReportModel: Model<DayEndReportDocument>,
    @InjectModel(PosSession.name)
    private posSessionModel: Model<PosSessionDocument>,
    @InjectModel('StaffShift')
    private staffShiftModel: Model<any>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  /**
   * Generate X-Report (Interim Report)
   * Computed on demand, NOT stored in database
   */
  async generateXReport(outletId: string): Promise<XReportResponseDto> {
    // Step 1: Find active POS session
    const activeSession = await this.posSessionModel
      .findOne({
        outletId,
        status: 'OPEN',
      })
      .exec();

    if (!activeSession) {
      throw new NotFoundException(
        'No active POS session found for this outlet. X-Report can only be generated for an open session.',
      );
    }

    // Step 2: Aggregate orders for this session
    const orderStats = await this.orderModel
      .aggregate([
        {
          $match: {
            posSessionId: activeSession._id,
            status: { $in: ['BILLED', 'COMPLETED'] },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSales: { $sum: '$total' },
            totalDiscount: { $sum: '$discount' },
            totalTax: { $sum: '$tax' },
          },
        },
      ])
      .exec();

    // Step 3: Aggregate payments for this session
    const paymentStats = await this.paymentModel
      .aggregate([
        {
          $match: {
            posSessionId: activeSession._id,
            status: 'COMPLETED',
          },
        },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    // Step 4: Build payment summary
    const paymentSummary = {
      CASH: 0,
      CARD: 0,
      UPI: 0,
      WALLET: 0,
      NET_BANKING: 0,
      OTHER: 0,
    };

    paymentStats.forEach((stat) => {
      const method = stat._id as keyof typeof paymentSummary;
      if (method in paymentSummary) {
        paymentSummary[method] = stat.total;
      } else {
        paymentSummary.OTHER += stat.total;
      }
    });

    // Step 5: Calculate expected cash
    const expectedCash =
      activeSession.openingCash +
      paymentSummary.CASH -
      (activeSession.cashRefunds || 0);

    // Step 6: Get active shifts summary
    const activeShifts = await this.staffShiftModel
      .find({
        posSessionId: activeSession._id,
        status: 'ACTIVE',
      })
      .exec();

    const staffSummary = activeShifts.map((shift) => ({
      userId: shift.userId,
      role: shift.roleAtShiftStart,
      shiftId: shift._id.toString(),
      totalOrders: shift.totalOrders,
      totalSales: shift.totalSales,
      cashCollected: shift.cashCollected,
    }));

    // Step 7: Calculate duration
    const duration = Math.round(
      (new Date().getTime() - activeSession.openedAt.getTime()) / 60000,
    ); // minutes

    return {
      posSessionId: activeSession._id.toString(),
      sessionNumber: activeSession.sessionNumber,
      restaurantId: activeSession.restaurantId,
      outletId: activeSession.outletId,
      generatedAt: new Date(),
      openingCash: activeSession.openingCash,
      expectedCash,
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalSales: orderStats[0]?.totalSales || 0,
      totalDiscount: orderStats[0]?.totalDiscount || 0,
      totalTax: orderStats[0]?.totalTax || 0,
      paymentSummary,
      cashRefunds: activeSession.cashRefunds || 0,
      staffSummary,
      openedAt: activeSession.openedAt,
      duration,
    };
  }

  /**
   * Generate Z-Report (Final Day-End Report)
   * Stored in database, closes POS Session, locks everything
   */
  async generateZReport(
    generateZReportDto: GenerateZReportDto,
    userId: string,
  ): Promise<ZReportResponseDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Step 1: Find active POS session
      const activeSession = await this.posSessionModel
        .findOne({
          outletId: generateZReportDto.outletId,
          status: 'OPEN',
        })
        .session(session)
        .exec();

      if (!activeSession) {
        throw new NotFoundException(
          'No active POS session found for this outlet. Z-Report can only be generated for an open session.',
        );
      }

      // Step 2: Check if Z-Report already exists for this session
      const existingReport = await this.dayEndReportModel
        .findOne({
          posSessionId: activeSession._id,
        })
        .session(session)
        .exec();

      if (existingReport) {
        throw new BadRequestException(
          `Z-Report already generated for session ${activeSession.sessionNumber}. Each session can only have one Z-Report.`,
        );
      }

      // Step 3: Check for pending orders (DRAFT or BILLED but not COMPLETED)
      const pendingOrders = await this.orderModel
        .find({
          posSessionId: activeSession._id,
          status: { $in: ['DRAFT', 'BILLED'] },
        })
        .session(session)
        .exec();

      if (pendingOrders.length > 0) {
        throw new BadRequestException(
          `Cannot generate Z-Report. ${pendingOrders.length} order(s) are still pending. All orders must be COMPLETED or CANCELLED before generating Z-Report.`,
        );
      }

      // Step 4: Recalculate session totals from actual orders and payments
      await this.recalculateSessionTotals(activeSession._id, session);

      // Step 5: Refresh session data
      const updatedSession = await this.posSessionModel
        .findById(activeSession._id)
        .session(session)
        .exec();

      if (!updatedSession) {
        throw new NotFoundException(
          'POS Session not found after recalculation',
        );
      }

      // Step 6: Aggregate orders for final summary (excluding voided bills)
      const orderStats = await this.orderModel
        .aggregate([
          {
            $match: {
              posSessionId: activeSession._id,
              status: { $in: ['BILLED', 'COMPLETED'] },
              isVoided: { $ne: true }, // Exclude voided bills
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSales: { $sum: '$netPayable' }, // Use netPayable (after round-off)
              totalDiscount: { $sum: '$discount' },
              totalTax: { $sum: '$tax' },
            },
          },
        ])
        .session(session)
        .exec();

      // Aggregate voided bills separately
      const voidedBillsStats = await this.orderModel
        .aggregate([
          {
            $match: {
              posSessionId: activeSession._id,
              isVoided: true,
            },
          },
          {
            $group: {
              _id: null,
              totalVoidedBills: { $sum: 1 },
              totalVoidedAmount: { $sum: '$originalBillAmount' },
            },
          },
        ])
        .session(session)
        .exec();

      // Aggregate complimentary items (query OrderItems directly)
      // First get all order IDs for this session
      const sessionOrderIds = await this.orderModel
        .find({
          posSessionId: activeSession._id,
          status: { $in: ['BILLED', 'COMPLETED'] },
          isVoided: { $ne: true },
        })
        .select('_id')
        .session(session)
        .lean()
        .exec();

      const orderIds = sessionOrderIds.map((o) => o._id);

      // Now aggregate complimentary items
      const complimentaryItemsStats = await this.orderItemModel
        .aggregate([
          {
            $match: {
              orderId: { $in: orderIds },
              isComplimentary: true,
            },
          },
          {
            $group: {
              _id: null,
              totalComplimentaryItemsCount: { $sum: '$quantity' },
              totalComplimentaryItemsValue: {
                $sum: {
                  // Use original price before complimentary (stored in taxableAmount or calculate from base price)
                  $cond: [
                    { $gt: ['$taxableAmount', 0] },
                    { $multiply: ['$taxableAmount', '$quantity'] },
                    { $multiply: ['$price', '$quantity'] },
                  ],
                },
              },
            },
          },
        ])
        .session(session)
        .exec();

      // Aggregate credit bills
      const creditBillsStats = await this.paymentModel
        .aggregate([
          {
            $match: {
              posSessionId: activeSession._id,
              paymentMethod: 'CREDIT',
              status: 'COMPLETED',
            },
          },
          {
            $group: {
              _id: null,
              totalCreditBills: { $sum: 1 },
              totalCreditOutstanding: {
                $sum: {
                  $cond: [
                    { $ne: ['$creditDetails.isSettled', true] },
                    '$amount',
                    0,
                  ],
                },
              },
              totalCreditSettled: {
                $sum: {
                  $cond: [
                    { $eq: ['$creditDetails.isSettled', true] },
                    '$amount',
                    0,
                  ],
                },
              },
            },
          },
        ])
        .session(session)
        .exec();

      // Step 7: Aggregate payments for final summary (exclude credit from cash calculations)
      const paymentStats = await this.paymentModel
        .aggregate([
          {
            $match: {
              posSessionId: activeSession._id,
              status: 'COMPLETED',
              // Exclude original credit payments (only count settlements)
              $or: [
                { paymentMethod: { $ne: 'CREDIT' } },
                { 'creditDetails.isSettled': true },
              ],
            },
          },
          {
            $group: {
              _id: '$paymentMethod',
              total: { $sum: '$amount' },
            },
          },
        ])
        .session(session)
        .exec();

      // Step 8: Build payment summary (including CREDIT)
      const paymentSummary = {
        CASH: 0,
        CARD: 0,
        UPI: 0,
        WALLET: 0,
        NET_BANKING: 0,
        CREDIT: 0,
        OTHER: 0,
      };

      paymentStats.forEach((stat) => {
        const method = stat._id as keyof typeof paymentSummary;
        if (method in paymentSummary) {
          paymentSummary[method] = stat.total;
        } else {
          paymentSummary.OTHER += stat.total;
        }
      });

      // Add credit bills to payment summary (for reporting)
      if (creditBillsStats[0]) {
        paymentSummary.CREDIT = creditBillsStats[0].totalCreditOutstanding || 0;
      }

      // Step 9: Calculate expected cash
      const expectedCash =
        updatedSession.openingCash +
        paymentSummary.CASH -
        (updatedSession.cashRefunds || 0);

      // Step 10: Get closing cash from session
      // Z-Report closes the session, so we need closing cash
      // Priority: Use session's closingCash if available (from closeSession API),
      // otherwise use cash drawer closing total, otherwise use expectedCash
      let closingCash = updatedSession.closingCash;

      if (!closingCash && updatedSession.cashDrawer?.closing) {
        // Use closing cash from cash drawer denominations
        closingCash = updatedSession.cashDrawer.closing.totalClosingCash;
      }

      if (!closingCash) {
        // If no closing cash provided, use expected cash (EXACT match)
        closingCash = expectedCash;
      }

      const cashDifference = closingCash - expectedCash;
      const cashStatus =
        Math.abs(cashDifference) < 0.01
          ? 'EXACT'
          : cashDifference < 0
            ? 'SHORT'
            : 'EXCESS';

      // Step 11: Get all shifts (active and closed) for this session
      const allShifts = await this.staffShiftModel
        .find({
          posSessionId: activeSession._id,
        })
        .session(session)
        .exec();

      // Step 12: Auto-close any active shifts
      const activeShifts = allShifts.filter((s) => s.status === 'ACTIVE');
      for (const shift of activeShifts) {
        // Recalculate shift totals before closing
        await this.recalculateShiftTotals(shift._id, session);

        // Refresh shift
        const updatedShift = await this.staffShiftModel
          .findById(shift._id)
          .session(session)
          .exec();

        // Calculate average order value
        const averageOrderValue =
          updatedShift.totalOrders > 0
            ? updatedShift.totalSales / updatedShift.totalOrders
            : 0;

        // Close the shift
        updatedShift.endedAt = new Date();
        updatedShift.averageOrderValue = averageOrderValue;
        updatedShift.status = 'CLOSED';
        await updatedShift.save({ session });
      }

      // Step 13: Refresh all shifts after closing
      const finalShifts = await this.staffShiftModel
        .find({
          posSessionId: activeSession._id,
        })
        .session(session)
        .exec();

      // Step 14: Build staff summary
      const staffSummary = finalShifts.map((shift) => ({
        userId: shift.userId,
        role: shift.roleAtShiftStart,
        shiftId: shift._id.toString(),
        totalOrders: shift.totalOrders,
        totalSales: shift.totalSales,
        cashCollected: shift.cashCollected,
      }));

      // Step 15: Create Z-Report document with all metrics
      const zReport = new this.dayEndReportModel({
        restaurantId: updatedSession.restaurantId,
        outletId: generateZReportDto.outletId,
        posSessionId: activeSession._id,
        reportType: 'Z',
        openingCash: updatedSession.openingCash,
        closingCash,
        expectedCash,
        cashDifference,
        cashStatus,
        totalOrders: orderStats[0]?.totalOrders || 0,
        totalSales: orderStats[0]?.totalSales || 0,
        totalDiscount: orderStats[0]?.totalDiscount || 0,
        totalTax: orderStats[0]?.totalTax || 0,
        // Complimentary Items Summary
        totalComplimentaryItemsValue:
          complimentaryItemsStats[0]?.totalComplimentaryItemsValue || 0,
        totalComplimentaryItemsCount:
          complimentaryItemsStats[0]?.totalComplimentaryItemsCount || 0,
        // Void Bills Summary
        totalVoidedBills: voidedBillsStats[0]?.totalVoidedBills || 0,
        totalVoidedAmount: voidedBillsStats[0]?.totalVoidedAmount || 0,
        // Credit Bills Summary
        totalCreditBills: creditBillsStats[0]?.totalCreditBills || 0,
        totalCreditOutstanding:
          creditBillsStats[0]?.totalCreditOutstanding || 0,
        totalCreditSettled: creditBillsStats[0]?.totalCreditSettled || 0,
        paymentSummary,
        staffSummary,
        generatedByUserId: userId,
        generatedAt: new Date(),
        notes: generateZReportDto.notes,
      });

      const savedReport = await zReport.save({ session });

      // Step 16: Close POS Session and attach Z-Report ID
      updatedSession.status = 'CLOSED';
      updatedSession.zReportId = savedReport._id;
      if (!updatedSession.closedAt) {
        updatedSession.closedAt = new Date();
      }
      if (!updatedSession.closedByUserId) {
        updatedSession.closedByUserId = userId;
      }
      if (!updatedSession.closingCash) {
        updatedSession.closingCash = closingCash;
      }
      if (!updatedSession.expectedCash) {
        updatedSession.expectedCash = expectedCash;
      }
      if (!updatedSession.cashDifference) {
        updatedSession.cashDifference = cashDifference;
      }
      if (!updatedSession.cashStatus) {
        updatedSession.cashStatus = cashStatus;
      }
      await updatedSession.save({ session });

      // Step 17: Commit transaction
      await session.commitTransaction();

      // Step 18: Format response
      return {
        reportId: savedReport._id.toString(),
        posSessionId: activeSession._id.toString(),
        sessionNumber: updatedSession.sessionNumber,
        restaurantId: savedReport.restaurantId,
        outletId: savedReport.outletId,
        reportType: savedReport.reportType,
        openingCash: savedReport.openingCash,
        closingCash: savedReport.closingCash,
        expectedCash: savedReport.expectedCash,
        cashDifference: savedReport.cashDifference,
        cashStatus: savedReport.cashStatus,
        totalOrders: savedReport.totalOrders,
        totalSales: savedReport.totalSales,
        totalDiscount: savedReport.totalDiscount,
        totalTax: savedReport.totalTax,
        totalComplimentaryItemsValue:
          savedReport.totalComplimentaryItemsValue,
        totalComplimentaryItemsCount:
          savedReport.totalComplimentaryItemsCount,
        totalVoidedBills: savedReport.totalVoidedBills,
        totalVoidedAmount: savedReport.totalVoidedAmount,
        totalCreditBills: savedReport.totalCreditBills,
        totalCreditOutstanding: savedReport.totalCreditOutstanding,
        totalCreditSettled: savedReport.totalCreditSettled,
        paymentSummary: savedReport.paymentSummary,
        staffSummary: savedReport.staffSummary,
        generatedByUserId: savedReport.generatedByUserId,
        generatedAt: savedReport.generatedAt,
        notes: savedReport.notes,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Recalculate session totals from orders and payments
   */
  private async recalculateSessionTotals(
    sessionId: Types.ObjectId,
    dbSession?: ClientSession,
  ): Promise<void> {
    // Aggregate orders for this session
    const orderStats = await this.orderModel
      .aggregate([
        {
          $match: {
            posSessionId: sessionId,
            status: { $in: ['BILLED', 'COMPLETED'] },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSales: { $sum: '$total' },
          },
        },
      ])
      .session(dbSession || null)
      .exec();

    // Aggregate payments for this session
    const paymentStats = await this.paymentModel
      .aggregate([
        {
          $match: {
            posSessionId: sessionId,
            status: 'COMPLETED',
          },
        },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
          },
        },
      ])
      .session(dbSession || null)
      .exec();

    // Build payment summary
    const paymentSummary = {
      CASH: 0,
      CARD: 0,
      UPI: 0,
      WALLET: 0,
      NET_BANKING: 0,
      OTHER: 0,
    };

    paymentStats.forEach((stat) => {
      const method = stat._id as keyof typeof paymentSummary;
      if (method in paymentSummary) {
        paymentSummary[method] = stat.total;
      } else {
        paymentSummary.OTHER += stat.total;
      }
    });

    // Update session
    await this.posSessionModel
      .findByIdAndUpdate(
        sessionId,
        {
          $set: {
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalSales: orderStats[0]?.totalSales || 0,
            paymentSummary,
          },
        },
        { session: dbSession },
      )
      .exec();
  }

  /**
   * Recalculate shift totals from orders and payments
   */
  private async recalculateShiftTotals(
    shiftId: Types.ObjectId,
    dbSession?: ClientSession,
  ): Promise<void> {
    // Aggregate orders for this shift
    const orderStats = await this.orderModel
      .aggregate([
        {
          $match: {
            createdByShiftId: shiftId,
            status: { $in: ['BILLED', 'COMPLETED'] },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSales: { $sum: '$total' },
          },
        },
      ])
      .session(dbSession || null)
      .exec();

    // Aggregate payments for this shift
    const paymentStats = await this.paymentModel
      .aggregate([
        {
          $match: {
            settledByShiftId: shiftId,
            status: 'COMPLETED',
          },
        },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
          },
        },
      ])
      .session(dbSession || null)
      .exec();

    // Build payment summary
    const paymentSummary = {
      CASH: 0,
      CARD: 0,
      UPI: 0,
      WALLET: 0,
      NET_BANKING: 0,
      OTHER: 0,
    };

    let cashCollected = 0;

    paymentStats.forEach((stat) => {
      const method = stat._id as keyof typeof paymentSummary;
      if (method in paymentSummary) {
        paymentSummary[method] = stat.total;
        if (method === 'CASH') {
          cashCollected = stat.total;
        }
      } else {
        paymentSummary.OTHER += stat.total;
      }
    });

    // Update shift
    await this.staffShiftModel
      .findByIdAndUpdate(
        shiftId,
        {
          $set: {
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalSales: orderStats[0]?.totalSales || 0,
            paymentSummary,
            cashCollected,
          },
        },
        { session: dbSession },
      )
      .exec();
  }

  /**
   * Find Z-Report by ID
   */
  async findZReportById(reportId: string): Promise<ZReportResponseDto> {
    const report = await this.dayEndReportModel.findById(reportId).exec();
    if (!report) {
      throw new NotFoundException(
        `Z-Report with ID ${reportId} not found`,
      );
    }

    // Get session for session number
    const posSession = await this.posSessionModel
      .findById(report.posSessionId)
      .exec();

    return {
      reportId: report._id.toString(),
      posSessionId: report.posSessionId.toString(),
      sessionNumber: posSession?.sessionNumber || '',
      restaurantId: report.restaurantId,
      outletId: report.outletId,
      reportType: report.reportType,
      openingCash: report.openingCash,
      closingCash: report.closingCash,
      expectedCash: report.expectedCash,
      cashDifference: report.cashDifference,
      cashStatus: report.cashStatus,
      totalOrders: report.totalOrders,
      totalSales: report.totalSales,
      totalDiscount: report.totalDiscount,
      totalTax: report.totalTax,
      paymentSummary: report.paymentSummary,
      staffSummary: report.staffSummary,
      generatedByUserId: report.generatedByUserId,
      generatedAt: report.generatedAt,
      notes: report.notes,
    };
  }

  /**
   * Find Z-Reports by filters
   */
  async findZReports(filters: {
    outletId?: string;
    restaurantId?: string;
    date?: string;
  }): Promise<ZReportResponseDto[]> {
    const query: any = {};

    if (filters.outletId) {
      query.outletId = filters.outletId;
    }

    if (filters.restaurantId) {
      query.restaurantId = filters.restaurantId;
    }

    if (filters.date) {
      const startDate = new Date(filters.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);

      query.generatedAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const reports = await this.dayEndReportModel
      .find(query)
      .sort({ generatedAt: -1 })
      .exec();

    // Get session numbers for all reports
    const sessionIds = reports.map((r) => r.posSessionId);
    const sessions = await this.posSessionModel
      .find({ _id: { $in: sessionIds } })
      .exec();
    const sessionMap = new Map(
      sessions.map((s) => [s._id.toString(), s.sessionNumber]),
    );

    return reports.map((report) => ({
      reportId: report._id.toString(),
      posSessionId: report.posSessionId.toString(),
      sessionNumber: sessionMap.get(report.posSessionId.toString()) || '',
      restaurantId: report.restaurantId,
      outletId: report.outletId,
      reportType: report.reportType,
      openingCash: report.openingCash,
      closingCash: report.closingCash,
      expectedCash: report.expectedCash,
      cashDifference: report.cashDifference,
      cashStatus: report.cashStatus,
      totalOrders: report.totalOrders,
      totalSales: report.totalSales,
      totalDiscount: report.totalDiscount,
      totalTax: report.totalTax,
      paymentSummary: report.paymentSummary,
      staffSummary: report.staffSummary,
      generatedByUserId: report.generatedByUserId,
      generatedAt: report.generatedAt,
      notes: report.notes,
    }));
  }
}

