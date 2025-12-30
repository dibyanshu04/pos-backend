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
import { TaxesService } from './taxes.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CreateTaxesDto } from './dto/create-taxes.dto';
import { UpdateTaxesDto } from './dto/update-taxes.dto';

@ApiTags('taxes')
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Taxes' })
  @ApiBody({ type: CreateTaxesDto })
  @ApiResponse({
    status: 201,
    description: 'Taxes created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async create(
    @Body() createTaxesDto: CreateTaxesDto,
  ): Promise<SuccessResponseDto<any>> {
    const taxes = await this.taxesService.create(createTaxesDto);
    return new SuccessResponseDto(taxes, 'Taxes created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all Taxeses' })
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Taxeses retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const taxeses = await this.taxesService.findAll(restaurantId);
    return new SuccessResponseDto(taxeses, 'Taxeses retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Taxes by ID' })
  @ApiParam({ name: 'id', description: 'Taxes ID' })
  @ApiResponse({
    status: 200,
    description: 'Taxes retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Taxes not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const taxes = await this.taxesService.findOne(id);
    return new SuccessResponseDto(taxes, 'Taxes retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Taxes' })
  @ApiParam({ name: 'id', description: 'Taxes ID' })
  @ApiBody({ type: UpdateTaxesDto })
  @ApiResponse({
    status: 200,
    description: 'Taxes updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Taxes not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTaxesDto: UpdateTaxesDto,
  ): Promise<SuccessResponseDto<any>> {
    const taxes = await this.taxesService.update(id, updateTaxesDto);
    return new SuccessResponseDto(taxes, 'Taxes updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a Taxes' })
  @ApiParam({ name: 'id', description: 'Taxes ID' })
  @ApiResponse({ status: 204, description: 'Taxes deleted successfully' })
  @ApiResponse({ status: 404, description: 'Taxes not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.taxesService.remove(id);
  }
}
