import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { CreateTableDto } from 'src/tables/dto/create-table.dto';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Area' })
  @ApiResponse({
    status: 201,
    description: 'Area created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
  })
  async create(@Body() createAreaDto: CreateAreaDto) {
    const area = await this.areaService.create(createAreaDto);
    return new SuccessResponseDto(area, 'Area created successfully');
  }

  // src/areas/areas.controller.ts
  @Get('with-tables')
  @ApiOperation({ summary: 'Get all areas populated with their tables' })
  async findAllWithTables(@Query('outletId') outletId: string) {
    console.log('Outlet ID:', outletId); // Debug log
    const data = await this.areaService.findAllWithTables(outletId);
    return new SuccessResponseDto(data, 'Areas retrieved successfully');
  }
  
  @Get()
  findAll() {
    return this.areaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.areaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(+id, updateAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areaService.remove(+id);
  }
}
