import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ReportQueryDto } from './dto/report-query.dto';
import { InventoryReportsService } from './inventory-reports.service';

@ApiTags('inventory-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory-reports')
export class InventoryReportsController {
  constructor(private readonly reportsService: InventoryReportsService) {}

  @Get('current-stock')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Current stock (ledger-derived)',
    description:
      'Computes current stock per raw material as SUM(quantityChange). No cached stock; derived live from ledger. stockValue = currentStock * averageCost.',
  })
  @ApiQuery({ name: 'outletId', required: true })
  @ApiOkResponse({ type: SuccessResponseDto })
  async currentStock(@Query() query: ReportQueryDto): Promise<SuccessResponseDto<any>> {
    const data = await this.reportsService.currentStock(query.outletId);
    return new SuccessResponseDto(data, 'Current stock derived from ledger');
  }

  @Get('consumption')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Consumption (sales-driven, ledger-derived)',
    description:
      'Aggregates SALE_CONSUMPTION transactions over date range. Quantities shown as positive; value uses averageCost snapshot.',
  })
  @ApiQuery({ name: 'outletId', required: true })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiOkResponse({ type: SuccessResponseDto })
  async consumption(@Query() query: ReportQueryDto): Promise<SuccessResponseDto<any>> {
    const range = this.reportsService.validateDateRange(query.from, query.to);
    const data = await this.reportsService.consumption(query.outletId, range);
    return new SuccessResponseDto(data, 'Consumption derived from ledger');
  }

  @Get('wastage')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Wastage report (ledger-derived)',
    description:
      'Aggregates WASTAGE transactions over date range. Provides total wasted quantity and reason breakup (by remarks).',
  })
  @ApiQuery({ name: 'outletId', required: true })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiOkResponse({ type: SuccessResponseDto })
  async wastage(@Query() query: ReportQueryDto): Promise<SuccessResponseDto<any>> {
    const range = this.reportsService.validateDateRange(query.from, query.to);
    const data = await this.reportsService.wastage(query.outletId, range);
    return new SuccessResponseDto(data, 'Wastage derived from ledger');
  }

  @Get('variance')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Variance report (opening + purchases - consumption - wastage ± adjustments - closing)',
    description:
      'Fully ledger-derived. Opening = sum before from; closing = sum up to to. Highlights unexplained variance per raw material.',
  })
  @ApiQuery({ name: 'outletId', required: true })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiOkResponse({ type: SuccessResponseDto })
  async variance(@Query() query: ReportQueryDto): Promise<SuccessResponseDto<any>> {
    const range = this.reportsService.validateDateRange(query.from, query.to);
    const data = await this.reportsService.variance(query.outletId, range);
    return new SuccessResponseDto(data, 'Variance derived from ledger');
  }
}

