import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession, Types } from 'mongoose';
import {
  PosSession,
  PosSessionDocument,
} from './schemas/pos-session.schema';

export { PosSessionDocument };
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Payment, PaymentDocument } from '../orders/schemas/payment.schema';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { SessionFilterDto } from './dto/session-filter.dto';
import { SessionSummaryDto } from './dto/session-summary.dto';

@Injectable()
export class PosSessionService {
  // Supported Indian currency denominations
  private readonly SUPPORTED_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000];

  constructor(
    @InjectModel(PosSession.name)
    private posSessionModel: Model<PosSessionDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  /**
   * Validate denominations: check for supported values, duplicates, and negative counts
   */
  private validateDenominations(denominations: Array<{ value: number; count: number }>): void {
    if (!denominations || denominations.length === 0) {
      throw new BadRequestException('At least one denomination is required');
    }

    const seenValues = new Set<number>();

    for (const denom of denominations) {
      // Check if value is supported
      if (!this.SUPPORTED_DENOMINATIONS.includes(denom.value)) {
        throw new BadRequestException(
          `Unsupported denomination value: ${denom.value}. Supported values: ${this.SUPPORTED_DENOMINATIONS.join(', ')}`,
        );
      }

      // Check for negative counts
      if (denom.count < 0) {
        throw new BadRequestException(
          `Denomination count cannot be negative. Value: ${denom.value}, Count: ${denom.count}`,
        );
      }

      // Check for duplicates
      if (seenValues.has(denom.value)) {
        throw new BadRequestException(
          `Duplicate denomination value: ${denom.value}. Each denomination can only appear once.`,
        );
      }

      seenValues.add(denom.value);
    }
  }

  /**
   * Calculate total cash from denominations
   */
  private calculateTotalFromDenominations(
    denominations: Array<{ value: number; count: number }>,
  ): { total: number; calculatedDenominations: Array<{ value: number; count: number; amount: number }> } {
    const calculatedDenominations = denominations.map((denom) => ({
      value: denom.value,
      count: denom.count,
      amount: denom.value * denom.count,
    }));

    const total = calculatedDenominations.reduce((sum, denom) => sum + denom.amount, 0);

    return { total, calculatedDenominations };
  }

  /**
   * Generate sequential session number for an outlet
   * Format: SESS-YYYY-MM-DD-XXX (e.g., SESS-2024-01-15-001)
   */
  private async generateSessionNumber(
    outletId: string,
    session?: ClientSession,
  ): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '-'); // YYYY-MM-DD
    const prefix = `SESS-${dateStr}`;

    // Find the latest session for this outlet on this date
    const latestSession = await this.posSessionModel
      .findOne({
        outletId,
        sessionNumber: new RegExp(`^${prefix}-`),
      })
      .sort({ sessionNumber: -1 })
      .session(session || null)
      .exec();

    let nextNumber = 1;
    if (latestSession && latestSession.sessionNumber) {
      // Extract number from SESS-YYYY-MM-DD-XXX format
      const match = latestSession.sessionNumber.match(/-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Open a new POS Session
   * Only one active session per outlet allowed
   */
  async openSession(
    openSessionDto: OpenSessionDto,
    userId: string,
  ): Promise<PosSession> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Check if there's already an active session for this outlet
      const activeSession = await this.posSessionModel
        .findOne({
          outletId: openSessionDto.outletId,
          status: 'OPEN',
        })
        .session(session)
        .exec();

      if (activeSession) {
        throw new BadRequestException(
          `An active POS session already exists for this outlet. Please close session ${activeSession.sessionNumber} first.`,
        );
      }

      // Generate session number
      const sessionNumber = await this.generateSessionNumber(
        openSessionDto.outletId,
        session,
      );

      // Handle denomination-wise opening cash drawer
      let openingCash = openSessionDto.openingCash;
      let cashDrawer: any = undefined;

      if (openSessionDto.openingCashDrawer?.denominations) {
        // Validate denominations
        this.validateDenominations(openSessionDto.openingCashDrawer.denominations);

        // Calculate total from denominations
        const { total, calculatedDenominations } =
          this.calculateTotalFromDenominations(
            openSessionDto.openingCashDrawer.denominations,
          );

        // Validate that calculated total matches provided openingCash (allow small tolerance)
        if (Math.abs(total - openingCash) > 0.01) {
          throw new BadRequestException(
            `Opening cash mismatch. Calculated from denominations: ${total}, Provided: ${openingCash}. They must match.`,
          );
        }

        openingCash = total; // Use calculated value for accuracy

        cashDrawer = {
          opening: {
            denominations: calculatedDenominations,
            totalOpeningCash: total,
          },
        };
      }

      // Create new session
      const newSession = new this.posSessionModel({
        sessionNumber,
        restaurantId: openSessionDto.restaurantId,
        outletId: openSessionDto.outletId,
        openedByUserId: userId,
        openedAt: new Date(),
        openingCash,
        openingNotes: openSessionDto.openingNotes,
        expectedCash: openingCash, // Initially equals opening cash
        cashDifference: 0,
        cashStatus: 'EXACT',
        totalOrders: 0,
        totalSales: 0,
        cashRefunds: 0,
        paymentSummary: {
          CASH: 0,
          CARD: 0,
          UPI: 0,
          WALLET: 0,
          NET_BANKING: 0,
          OTHER: 0,
        },
        cashDrawer,
        status: 'OPEN',
      });

      const savedSession = await newSession.save({ session });
      await session.commitTransaction();

      return savedSession;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Close a POS Session
   * Validates that all orders are settled before closing
   */
  async closeSession(
    closeSessionDto: CloseSessionDto,
    userId: string,
  ): Promise<PosSession> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Find the session
      const posSession = await this.posSessionModel
        .findById(closeSessionDto.sessionId)
        .session(session)
        .exec();

      if (!posSession) {
        throw new NotFoundException(
          `POS Session with ID ${closeSessionDto.sessionId} not found`,
        );
      }

      if (posSession.status === 'CLOSED') {
        throw new BadRequestException(
          `Session ${posSession.sessionNumber} is already closed`,
        );
      }

      // Check for unsettled orders (DRAFT or BILLED but not COMPLETED)
      const unsettledOrders = await this.orderModel
        .find({
          posSessionId: posSession._id,
          status: { $in: ['DRAFT', 'BILLED'] },
        })
        .session(session)
        .exec();

      if (unsettledOrders.length > 0) {
        throw new BadRequestException(
          `Cannot close session. ${unsettledOrders.length} order(s) are not yet completed. Please settle all orders before closing.`,
        );
      }

      // Recalculate session totals from actual orders and payments
      await this.recalculateSessionTotals(posSession._id, session);

      // Refresh session data
      const updatedSession = await this.posSessionModel
        .findById(posSession._id)
        .session(session)
        .exec();

      // Handle denomination-wise closing cash drawer
      let closingCash = closeSessionDto.closingCash;
      let cashDrawerUpdate: any = {};

      if (closeSessionDto.closingCashDrawer?.denominations) {
        // Validate denominations
        this.validateDenominations(closeSessionDto.closingCashDrawer.denominations);

        // Calculate total from denominations
        const { total, calculatedDenominations } =
          this.calculateTotalFromDenominations(
            closeSessionDto.closingCashDrawer.denominations,
          );

        // Validate that calculated total matches provided closingCash (allow small tolerance)
        if (Math.abs(total - closingCash) > 0.01) {
          throw new BadRequestException(
            `Closing cash mismatch. Calculated from denominations: ${total}, Provided: ${closingCash}. They must match.`,
          );
        }

        closingCash = total; // Use calculated value for accuracy

        // Preserve opening cash drawer if it exists
        cashDrawerUpdate = {
          ...(updatedSession.cashDrawer || {}),
          closing: {
            denominations: calculatedDenominations,
            totalClosingCash: total,
          },
        };
      } else {
        // If no denominations provided, preserve existing cashDrawer structure
        cashDrawerUpdate = updatedSession.cashDrawer || {};
      }

      // Calculate expected cash: openingCash + cashSales - cashRefunds
      const expectedCash =
        updatedSession.openingCash +
        updatedSession.paymentSummary.CASH -
        (updatedSession.cashRefunds || 0);

      const cashDifference = closingCash - expectedCash;
      const cashStatus =
        Math.abs(cashDifference) < 0.01
          ? 'EXACT'
          : cashDifference < 0
            ? 'SHORT'
            : 'EXCESS';

      // Update session with closing information
      updatedSession.closedByUserId = userId;
      updatedSession.closedAt = new Date();
      updatedSession.closingCash = closingCash;
      updatedSession.closingNotes = closeSessionDto.closingNotes;
      updatedSession.expectedCash = expectedCash;
      updatedSession.cashDifference = cashDifference;
      updatedSession.cashStatus = cashStatus;
      updatedSession.status = 'CLOSED';
      updatedSession.cashDrawer = cashDrawerUpdate;

      const savedSession = await updatedSession.save({ session });
      await session.commitTransaction();

      return savedSession;
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
   * Get active session for an outlet
   */
  async findActiveSession(
    outletId: string,
  ): Promise<PosSessionDocument | null> {
    return this.posSessionModel
      .findOne({
        outletId,
        status: 'OPEN',
      })
      .exec();
  }

  /**
   * Find all sessions with filters
   */
  async findAll(filters: SessionFilterDto): Promise<PosSession[]> {
    const query: any = {};

    if (filters.outletId) {
      query.outletId = filters.outletId;
    }

    if (filters.restaurantId) {
      query.restaurantId = filters.restaurantId;
    }

    if (filters.openedByUserId) {
      query.openedByUserId = filters.openedByUserId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.openedAt = {};
      if (filters.startDate) {
        query.openedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.openedAt.$lte = new Date(filters.endDate);
      }
    }

    return this.posSessionModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Find one session by ID
   */
  async findOne(sessionId: string): Promise<PosSession> {
    const session = await this.posSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException(
        `POS Session with ID ${sessionId} not found`,
      );
    }
    return session;
  }

  /**
   * Get detailed summary of a session
   */
  async getSummary(sessionId: string): Promise<SessionSummaryDto> {
    const session = await this.findOne(sessionId);

    // Calculate duration if closed
    let duration: number | undefined;
    if (session.closedAt && session.openedAt) {
      duration = Math.round(
        (session.closedAt.getTime() - session.openedAt.getTime()) / 60000,
      ); // minutes
    }

    return {
      sessionId: session._id.toString(),
      sessionNumber: session.sessionNumber,
      restaurantId: session.restaurantId,
      outletId: session.outletId,
      openingCash: session.openingCash,
      closingCash: session.closingCash,
      expectedCash: session.expectedCash,
      cashDifference: session.cashDifference,
      cashStatus: session.cashStatus,
      cashRefunds: session.cashRefunds || 0,
      totalOrders: session.totalOrders,
      totalSales: session.totalSales,
      paymentSummary: session.paymentSummary,
      cashDrawer: session.cashDrawer
        ? {
            opening: session.cashDrawer.opening,
            closing: session.cashDrawer.closing,
          }
        : undefined,
      status: session.status,
      openedAt: session.openedAt,
      closedAt: session.closedAt,
      openedByUserId: session.openedByUserId,
      closedByUserId: session.closedByUserId,
      duration,
    };
  }

  /**
   * Update session totals when an order is created or settled
   * This is called from the order service
   */
  async updateSessionOnOrderSettlement(
    sessionId: Types.ObjectId,
    orderTotal: number,
    paymentMethod: string,
    dbSession?: ClientSession,
  ): Promise<void> {
    const updateData: any = {
      $inc: {
        totalOrders: 1,
        totalSales: orderTotal,
      },
    };

    // Update payment summary
    const paymentMethodKey = paymentMethod as keyof typeof updateData.$inc;
    if (
      ['CASH', 'CARD', 'UPI', 'WALLET', 'NET_BANKING'].includes(paymentMethod)
    ) {
      updateData.$inc[`paymentSummary.${paymentMethod}`] = orderTotal;
    } else {
      updateData.$inc['paymentSummary.OTHER'] = orderTotal;
    }

    await this.posSessionModel
      .findByIdAndUpdate(sessionId, updateData, { session: dbSession })
      .exec();
  }
}

