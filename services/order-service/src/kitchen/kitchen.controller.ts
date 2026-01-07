import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KitchenService } from './kitchen.service';
import { CreateKitchenDto } from './dto/create-kitchen.dto';
import { UpdateKitchenDto } from './dto/update-kitchen.dto';
import { UpdateKitchenStatusDto } from './dto/update-kitchen-status.dto';
import { KitchenResponseDto } from './dto/kitchen-response.dto';
import { SuccessResponseDto } from '../orders/dto/success-response.dto';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Kitchens')
@Controller('kitchens')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new kitchen' })
  @ApiResponse({
    status: 201,
    description: 'Kitchen created successfully',
    type: KitchenResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Kitchen code already exists' })
  // @Roles('OWNER', 'MANAGER')
  // @Permissions('kitchen:write')
  async create(
    @Body() createKitchenDto: CreateKitchenDto,
  ): Promise<SuccessResponseDto<KitchenResponseDto>> {
    const kitchen = await this.kitchenService.create(createKitchenDto);
    return new SuccessResponseDto(
      kitchen,
      'Kitchen created successfully',
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all kitchens for an outlet' })
  @ApiResponse({
    status: 200,
    description: 'Kitchens retrieved successfully',
    type: [KitchenResponseDto],
  })
  // @Roles('OWNER', 'MANAGER', 'CHEF', 'CASHIER')
  // @Permissions('kitchen:read')
  async findAll(
    @Query('outletId') outletId: string,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<SuccessResponseDto<KitchenResponseDto[]>> {
    if (!outletId) {
      throw new Error('outletId query parameter is required');
    }

    const kitchens = includeInactive === 'true'
      ? await this.kitchenService.findAllByOutlet(outletId)
      : await this.kitchenService.findByOutlet(outletId);

    return new SuccessResponseDto(
      kitchens,
      'Kitchens retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get kitchen by ID' })
  @ApiResponse({
    status: 200,
    description: 'Kitchen retrieved successfully',
    type: KitchenResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Kitchen not found' })
  // @Roles('OWNER', 'MANAGER', 'CHEF', 'CASHIER')
  // @Permissions('kitchen:read')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<KitchenResponseDto>> {
    const kitchen = await this.kitchenService.findOne(id);
    return new SuccessResponseDto(
      kitchen,
      'Kitchen retrieved successfully',
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update kitchen' })
  @ApiResponse({
    status: 200,
    description: 'Kitchen updated successfully',
    type: KitchenResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Kitchen not found' })
  @ApiResponse({ status: 409, description: 'Kitchen code conflict' })
  // @Roles('OWNER', 'MANAGER')
  // @Permissions('kitchen:write')
  async update(
    @Param('id') id: string,
    @Body() updateKitchenDto: UpdateKitchenDto,
  ): Promise<SuccessResponseDto<KitchenResponseDto>> {
    const kitchen = await this.kitchenService.update(id, updateKitchenDto);
    return new SuccessResponseDto(
      kitchen,
      'Kitchen updated successfully',
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update kitchen status (active/inactive)' })
  @ApiResponse({
    status: 200,
    description: 'Kitchen status updated successfully',
    type: KitchenResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Kitchen not found' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate default kitchen' })
  // @Roles('OWNER', 'MANAGER')
  // @Permissions('kitchen:write')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateKitchenStatusDto,
  ): Promise<SuccessResponseDto<KitchenResponseDto>> {
    const kitchen = await this.kitchenService.updateStatus(id, updateStatusDto);
    return new SuccessResponseDto(
      kitchen,
      'Kitchen status updated successfully',
    );
  }
}

