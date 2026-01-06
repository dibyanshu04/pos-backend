import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { LowStockAlertService } from './low-stock-alert.service';

@ApiTags('low-stock-alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LowStockAlertController {
  constructor(private readonly lowStockAlertService: LowStockAlertService) {}

  @Get('low-stock-alerts')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Get active low stock alerts',
    description: 'Returns open alerts. Alerts are derived from ledger stock and thresholds.',
  })
  @ApiQuery({ name: 'outletId', required: true })
  @ApiOkResponse({ type: SuccessResponseDto })
  async getActive(@Query('outletId') outletId: string): Promise<SuccessResponseDto<any>> {
    const alerts = await this.lowStockAlertService.getActiveAlerts(outletId);
    return new SuccessResponseDto(alerts, 'Active low stock alerts');
  }

  @Get('low-stock-alerts/history')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Get low stock alert history',
    description: 'Returns alert history (resolved + active) filtered by outlet and optional rawMaterialId.',
  })
  @ApiQuery({ name: 'outletId', required: true })
  @ApiQuery({ name: 'rawMaterialId', required: false })
  @ApiOkResponse({ type: SuccessResponseDto })
  async getHistory(
    @Query('outletId') outletId: string,
    @Query('rawMaterialId') rawMaterialId?: string,
  ): Promise<SuccessResponseDto<any>> {
    const alerts = await this.lowStockAlertService.getAlertHistory(outletId, rawMaterialId);
    return new SuccessResponseDto(alerts, 'Low stock alert history');
  }
}

