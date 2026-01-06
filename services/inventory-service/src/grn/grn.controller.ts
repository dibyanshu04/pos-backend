import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateGrnDto } from './dto/create-grn.dto';
import { GrnService } from './grn.service';

@ApiTags('grns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grns')
export class GrnController {
  constructor(private readonly grnService: GrnService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create GRN (immutable, transactional)',
    description:
      'Creates a GRN, snapshots costs, updates weighted average cost, and writes purchase ledger entries atomically. GRNs are immutable.',
  })
  @ApiBody({ type: CreateGrnDto })
  @ApiResponse({
    status: 201,
    description: 'GRN created; ledger and costing updated atomically',
    type: SuccessResponseDto,
  })
  async create(
    @Body() dto: CreateGrnDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto<any>> {
    const userId = req.user?.id || req.user?.userId || 'system';
    dto.createdByUserId = dto.createdByUserId || userId;
    const grn = await this.grnService.createGrn(dto, userId);
    return new SuccessResponseDto(grn, 'GRN created successfully');
  }

  @Get()
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'List GRNs for an outlet',
    description: 'Returns GRNs (immutable records) for an outlet, sorted newest first.',
  })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findAll(@Query('outletId') outletId: string): Promise<SuccessResponseDto<any[]>> {
    const grns = await this.grnService.findAll(outletId);
    return new SuccessResponseDto(grns, 'GRNs retrieved');
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Get GRN by id', description: 'Fetches immutable GRN record with cost snapshots.' })
  @ApiParam({ name: 'id', description: 'GRN ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const grn = await this.grnService.findOne(id);
    return new SuccessResponseDto(grn, 'GRN retrieved');
  }
}

