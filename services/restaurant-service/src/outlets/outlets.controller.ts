import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OutletsService } from './outlets.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';

@ApiTags('outlets')
@Controller('outlets')
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new outlet' })
  @ApiBody({ type: CreateOutletDto })
  @ApiResponse({
    status: 201,
    description: 'Outlet created successfully',
    type: SuccessResponseDto,
  })
  async create(
    @Body() createOutletDto: CreateOutletDto,
  ): Promise<SuccessResponseDto<any>> {
    const outlet = await this.outletsService.create(createOutletDto);
    return new SuccessResponseDto(outlet, 'Outlet created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all outlets for a restaurant' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Outlets retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const outlets = await this.outletsService.findAll(restaurantId);
    return new SuccessResponseDto(outlets, 'Outlets retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get outlet by ID' })
  @ApiParam({ name: 'id', description: 'Outlet ID' })
  @ApiResponse({
    status: 200,
    description: 'Outlet retrieved successfully',
    type: SuccessResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const outlet = await this.outletsService.findOne(id);
    return new SuccessResponseDto(outlet, 'Outlet retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an outlet' })
  @ApiParam({ name: 'id', description: 'Outlet ID' })
  @ApiBody({ type: UpdateOutletDto })
  @ApiResponse({
    status: 200,
    description: 'Outlet updated successfully',
    type: SuccessResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateOutletDto: UpdateOutletDto,
  ): Promise<SuccessResponseDto<any>> {
    const outlet = await this.outletsService.update(id, updateOutletDto);
    return new SuccessResponseDto(outlet, 'Outlet updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an outlet' })
  @ApiParam({ name: 'id', description: 'Outlet ID' })
  @ApiResponse({ status: 204, description: 'Outlet deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.outletsService.remove(id);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get active outlets for a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Active outlets retrieved successfully',
    type: SuccessResponseDto,
  })
  async findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const outlets = await this.outletsService.findByRestaurant(restaurantId);
    return new SuccessResponseDto(
      outlets,
      'Active outlets retrieved successfully',
    );
  }

  @Put(':id/status/:status')
  @ApiOperation({ summary: 'Update outlet status' })
  @ApiParam({ name: 'id', description: 'Outlet ID' })
  @ApiParam({
    name: 'status',
    description: 'Status (active, inactive, maintenance)',
  })
  @ApiResponse({
    status: 200,
    description: 'Outlet status updated successfully',
    type: SuccessResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
  ): Promise<SuccessResponseDto<any>> {
    const outlet = await this.outletsService.updateStatus(id, status);
    return new SuccessResponseDto(outlet, 'Outlet status updated successfully');
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get outlet statistics' })
  @ApiParam({ name: 'id', description: 'Outlet ID' })
  @ApiResponse({
    status: 200,
    description: 'Outlet stats retrieved successfully',
    type: SuccessResponseDto,
  })
  async getOutletStats(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const stats = await this.outletsService.getOutletStats(id);
    return new SuccessResponseDto(stats, 'Outlet stats retrieved successfully');
  }
}
