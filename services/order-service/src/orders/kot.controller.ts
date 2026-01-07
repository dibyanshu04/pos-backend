import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { KotReprintDto } from './dto/kot-reprint.dto';
import { KotCancelDto } from './dto/kot-cancel.dto';
import { KotTransferDto } from './dto/kot-transfer.dto';
import { SuccessResponseDto } from './dto/success-response.dto';
import { KotResponseDto } from './dto/kot-response.dto';
// TODO: Add RBAC guards when auth-service integration is complete
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('kots')
@Controller('kots')
@ApiBearerAuth()
// TODO: Add RBAC when auth-service integration is complete
// @UseGuards(JwtAuthGuard, RolesGuard)
export class KotController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':id/reprint')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reprint a KOT',
    description:
      'Creates a new REPRINT type KOT with the same kotNumber and items. Original KOT remains unchanged. Requires OWNER, MANAGER, or CASHIER role.',
  })
  @ApiParam({ name: 'id', description: 'KOT ID to reprint' })
  @ApiBody({ type: KotReprintDto })
  @ApiResponse({
    status: 201,
    description: 'KOT reprinted successfully',
    type: KotResponseDto,
  })
  @ApiResponse({ status: 404, description: 'KOT not found' })
  @ApiResponse({ status: 400, description: 'Invalid KOT status or session closed' })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER', 'CASHIER')
  async reprint(
    @Param('id') kotId: string,
    @Body() reprintDto: KotReprintDto,
    @Request() req: any, // TODO: Replace with proper user decorator
  ): Promise<SuccessResponseDto<KotResponseDto>> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.userId || 'system'; // Temporary fallback

    const reprintKot = await this.ordersService.reprintKot(
      kotId,
      reprintDto,
      userId,
    );

    return new SuccessResponseDto(
      reprintKot,
      'KOT reprinted successfully',
    );
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cancel a KOT (Full or Partial)',
    description:
      'Creates a new CANCELLATION type KOT. Can cancel entire KOT or specific items by orderItemId. Original KOT remains unchanged. Requires OWNER or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'KOT ID to cancel' })
  @ApiBody({ type: KotCancelDto })
  @ApiResponse({
    status: 201,
    description: 'KOT cancelled successfully',
    type: KotResponseDto,
  })
  @ApiResponse({ status: 404, description: 'KOT not found' })
  @ApiResponse({ status: 400, description: 'Invalid cancellation request' })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER')
  async cancel(
    @Param('id') kotId: string,
    @Body() cancelDto: KotCancelDto,
    @Request() req: any, // TODO: Replace with proper user decorator
  ): Promise<SuccessResponseDto<KotResponseDto>> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.userId || 'system'; // Temporary fallback

    const cancellationKot = await this.ordersService.cancelKot(
      kotId,
      cancelDto,
      userId,
    );

    return new SuccessResponseDto(
      cancellationKot,
      'KOT cancelled successfully',
    );
  }

  @Post(':id/transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Transfer KOT items to another kitchen',
    description:
      'Transfers items from source kitchen to destination kitchen by orderItemId. Creates 2 KOTs: CANCELLATION in source and NORMAL in destination. Requires OWNER or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'KOT ID to transfer items from' })
  @ApiBody({ type: KotTransferDto })
  @ApiResponse({
    status: 201,
    description: 'KOT items transferred successfully',
    schema: {
      type: 'object',
      properties: {
        cancellationKot: { $ref: '#/components/schemas/KotResponseDto' },
        transferKot: { $ref: '#/components/schemas/KotResponseDto' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'KOT or kitchen not found' })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER')
  async transfer(
    @Param('id') kotId: string,
    @Body() transferDto: KotTransferDto,
    @Request() req: any, // TODO: Replace with proper user decorator
  ): Promise<SuccessResponseDto<{ cancellationKot: KotResponseDto; transferKot: KotResponseDto }>> {
    // TODO: Extract userId from JWT token when auth is implemented
    const userId = req.user?.userId || 'system'; // Temporary fallback

    const result = await this.ordersService.transferKot(
      kotId,
      transferDto,
      userId,
    );

    return new SuccessResponseDto(
      result,
      'KOT items transferred successfully',
    );
  }
}

