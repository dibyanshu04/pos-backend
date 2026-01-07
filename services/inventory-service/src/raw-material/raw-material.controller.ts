import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RawMaterialService } from './raw-material.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { UpdateRawMaterialStatusDto } from './dto/update-raw-material-status.dto';
import { BadRequestException } from '@nestjs/common';

@ApiTags('raw-materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('raw-materials')
export class RawMaterialController {
  constructor(private readonly rawMaterialService: RawMaterialService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create raw material (costing-ready, no stock)',
    description:
      'Creates a raw material master. Code & name must be unique per outlet. Costing fields are stored for ledger integration later.',
  })
  @ApiBody({ type: CreateRawMaterialDto })
  @ApiResponse({
    status: 201,
    description: 'Raw material created',
    type: SuccessResponseDto,
  })
  async create(
    @Body() createDto: CreateRawMaterialDto,
  ): Promise<SuccessResponseDto<any>> {
    const material = await this.rawMaterialService.create(createDto);
    return new SuccessResponseDto(material, 'Raw material created successfully');
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'CHEF')
  @ApiOperation({
    summary: 'List raw materials by outlet',
    description:
      'Returns all raw materials for an outlet (active/inactive). Use isActive filter later when ledger arrives.',
  })
  @ApiQuery({
    name: 'outletId',
    required: true,
    description: 'Outlet ID (uniqueness scope)',
  })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findAll(
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const materials = await this.rawMaterialService.findAll(outletId);
    return new SuccessResponseDto(
      materials,
      'Raw materials retrieved successfully',
    );
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'CHEF')
  @ApiOperation({
    summary: 'Get raw material by id',
    description:
      'Fetch a raw material by id. Includes costing snapshot. No stock information is returned here.',
  })
  @ApiParam({ name: 'id', description: 'Raw material id' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const material = await this.rawMaterialService.findOne(id);
    return new SuccessResponseDto(material, 'Raw material retrieved');
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Update raw material (no stock changes)',
    description:
      'Updates raw material master data. Does not touch stock or ledger.',
  })
  @ApiParam({ name: 'id', description: 'Raw material id' })
  @ApiBody({ type: UpdateRawMaterialDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRawMaterialDto,
  ): Promise<SuccessResponseDto<any>> {
    const updated = await this.rawMaterialService.update(id, updateDto);
    return new SuccessResponseDto(updated, 'Raw material updated successfully');
  }

  @Put(':id/status')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Activate / deactivate raw material (soft delete)',
    description:
      'Soft delete via isActive. Prevents hard deletes to keep audit/ledger integrity.',
  })
  @ApiParam({ name: 'id', description: 'Raw material id' })
  @ApiBody({ type: UpdateRawMaterialStatusDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateRawMaterialStatusDto,
  ): Promise<SuccessResponseDto<any>> {
    const updated = await this.rawMaterialService.updateStatus(id, statusDto);
    return new SuccessResponseDto(
      updated,
      statusDto.isActive
        ? 'Raw material activated'
        : 'Raw material deactivated',
    );
  }

  @Put(':id/low-stock-threshold')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Set/update low stock threshold (base unit)',
    description:
      'Threshold is stored in base unit and used for alerting. Setting triggers immediate reconciliation. Must be >= 0.',
  })
  @ApiParam({ name: 'id', description: 'Raw material id' })
  @ApiBody({
    schema: {
      properties: { lowStockThreshold: { type: 'number', minimum: 0, example: 2000 } },
      required: ['lowStockThreshold'],
    },
  })
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateLowStockThreshold(
    @Param('id') id: string,
    @Body() body: { lowStockThreshold: number },
  ): Promise<SuccessResponseDto<any>> {
    if (body.lowStockThreshold === undefined || body.lowStockThreshold < 0) {
      throw new BadRequestException('lowStockThreshold must be >= 0');
    }
    const updated = await this.rawMaterialService.updateLowStockThreshold(
      id,
      body.lowStockThreshold,
    );
    return new SuccessResponseDto(updated, 'Low stock threshold updated');
  }
}

