import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { SettleCreditDto } from '../orders/dto/settle-credit.dto';
import { SuccessResponseDto } from '../orders/dto/success-response.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':paymentId/settle-credit')
  @HttpCode(HttpStatus.OK)
  async settleCredit(
    @Param('paymentId') paymentId: string,
    @Body() settleCreditDto: SettleCreditDto,
    @Request() req: any, // TODO: Replace with proper user decorator
  ): Promise<SuccessResponseDto<any>> {
    // TODO: Extract userId from JWT token when auth is implemented
    // TODO: Add RBAC guard (OWNER, MANAGER, optionally CASHIER)
    const userId = req.user?.userId || 'system'; // Temporary fallback

    const result = await this.ordersService.settleCredit(
      paymentId,
      settleCreditDto,
      userId,
    );
    return new SuccessResponseDto(result, 'Credit bill settled successfully');
  }
}

