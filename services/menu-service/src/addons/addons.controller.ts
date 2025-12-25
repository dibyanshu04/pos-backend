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
import { AddonsService } from './addons.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';

@ApiTags('addons')
@Controller('addons')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new addon group' })
  @ApiBody({ type: CreateAddonDto })
  @ApiResponse({
    status: 201,
    description: 'Addon created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async create(
    @Body() createAddonDto: CreateAddonDto,
  ): Promise<SuccessResponseDto<any>> {
    const addon = await this.addonsService.create(createAddonDto);
    return new SuccessResponseDto(addon, 'Addon created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all addons for a restaurant' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Addons retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const addons = await this.addonsService.findAll(restaurantId);
    return new SuccessResponseDto(addons, 'Addons retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get addon by ID' })
  @ApiParam({ name: 'id', description: 'Addon ID' })
  @ApiResponse({
    status: 200,
    description: 'Addon retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Addon not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const addon = await this.addonsService.findOne(id);
    return new SuccessResponseDto(addon, 'Addon retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an addon' })
  @ApiParam({ name: 'id', description: 'Addon ID' })
  @ApiBody({ type: UpdateAddonDto })
  @ApiResponse({
    status: 200,
    description: 'Addon updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Addon not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAddonDto: UpdateAddonDto,
  ): Promise<SuccessResponseDto<any>> {
    const addon = await this.addonsService.update(id, updateAddonDto);
    return new SuccessResponseDto(addon, 'Addon updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an addon' })
  @ApiParam({ name: 'id', description: 'Addon ID' })
  @ApiResponse({ status: 204, description: 'Addon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Addon not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.addonsService.remove(id);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get active addons for a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Active addons retrieved successfully',
    type: SuccessResponseDto,
  })
  async findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const addons = await this.addonsService.findByRestaurant(restaurantId);
    return new SuccessResponseDto(
      addons,
      'Active addons retrieved successfully',
    );
  }

  @Put('rank/update')
  @ApiOperation({ summary: 'Update addon ranks in bulk' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          rank: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ranks updated successfully',
    type: SuccessResponseDto,
  })
  async updateRank(
    @Body() updates: Array<{ id: string; rank: number }>,
  ): Promise<SuccessResponseDto<any>> {
    await this.addonsService.updateRank(updates);
    return new SuccessResponseDto(null, 'Ranks updated successfully');
  }
}

