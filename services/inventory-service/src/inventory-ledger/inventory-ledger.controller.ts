import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdjustmentDto } from './dto/adjustment.dto';
import { OpeningBalanceDto } from './dto/opening-balance.dto';
import { InventoryLedgerService } from './inventory-ledger.service';

@ApiTags('inventory-ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory-ledger')
export class InventoryLedgerController {
  constructor(private readonly ledgerService: InventoryLedgerService) {}

  @Post('opening-balance')
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create opening balance (one-time per raw material per outlet)',
    description:
      'Records the initial stock as an immutable ledger entry. Allowed once per raw material per outlet. Ledger is append-only.',
  })
  @ApiBody({ type: OpeningBalanceDto })
  @ApiResponse({
    status: 201,
    description: 'Opening balance recorded',
    type: SuccessResponseDto,
  })
  async createOpeningBalance(
    @Body() dto: OpeningBalanceDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto<any>> {
    const userId = req.user?.id || req.user?.userId || 'system';
    const entry = await this.ledgerService.createOpeningBalance(dto, userId);
    return new SuccessResponseDto(entry, 'Opening balance recorded');
  }

  @Post('adjustment')
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create manual adjustment (append-only)',
    description:
      'Adds a positive/negative adjustment entry. No edits or deletes; corrections are new entries.',
  })
  @ApiBody({ type: AdjustmentDto })
  @ApiResponse({
    status: 201,
    description: 'Adjustment recorded',
    type: SuccessResponseDto,
  })
  async createAdjustment(
    @Body() dto: AdjustmentDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto<any>> {
    const userId = req.user?.id || req.user?.userId || 'system';
    const entry = await this.ledgerService.createAdjustment(dto, userId);
    return new SuccessResponseDto(entry, 'Adjustment recorded');
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'CHEF')
  @ApiOperation({
    summary: 'List ledger entries (chronological)',
    description:
      'Returns immutable ledger entries for a raw material & outlet, sorted by creation time.',
  })
  @ApiQuery({ name: 'rawMaterialId', required: true, description: 'Raw material ID' })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findEntries(
    @Query('rawMaterialId') rawMaterialId: string,
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const entries = await this.ledgerService.findEntries(rawMaterialId, outletId);
    return new SuccessResponseDto(entries, 'Ledger entries retrieved');
  }

  @Get('stock')
  @Roles('OWNER', 'MANAGER', 'CHEF')
  @ApiOperation({
    summary: 'Get current stock (derived, never stored)',
    description:
      'Computes stock as SUM(quantityChange). No currentStock field exists; ledger is the single source of truth.',
  })
  @ApiQuery({ name: 'rawMaterialId', required: true, description: 'Raw material ID' })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async getCurrentStock(
    @Query('rawMaterialId') rawMaterialId: string,
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any>> {
    const stock = await this.ledgerService.getCurrentStock(rawMaterialId, outletId);
    return new SuccessResponseDto(
      stock,
      'Derived stock computed from ledger (append-only, immutable)',
    );
  }
}

