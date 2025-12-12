import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
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
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

@ApiTags('tables')
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  // @Permissions("tables.create")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new table' })
  @ApiBody({ type: CreateTableDto })
  @ApiResponse({
    status: 201,
    description: 'Table created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed',
  })
  async create(@Body() dto: CreateTableDto): Promise<SuccessResponseDto<any>> {
    const table = await this.tableService.create(dto);
    return new SuccessResponseDto(table, 'Table created successfully');
  }

  @Get()
  // @Permissions("tables.view")
  @ApiOperation({ summary: 'Get all tables' })
  @ApiQuery({
    name: 'outletId',
    required: true,
    description: 'Filter tables by Outlet ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Tables retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const tables = await this.tableService.findAll(outletId);
    return new SuccessResponseDto(tables, 'Tables retrieved successfully');
  }

  @Get(':id')
  // @Permissions("tables.view")
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({
    status: 200,
    description: 'Table retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const table = await this.tableService.findOne(id);
    return new SuccessResponseDto(table, 'Table retrieved successfully');
  }

  @Patch(':id')
  // @Permissions("tables.update")
  @ApiOperation({ summary: 'Update a table' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiBody({ type: UpdateTableDto })
  @ApiResponse({
    status: 200,
    description: 'Table updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<SuccessResponseDto<any>> {
    const table = await this.tableService.update(id, dto);
    return new SuccessResponseDto(table, 'Table updated successfully');
  }

  @Delete(':id')
  // @Permissions("tables.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a table' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 204, description: 'Table deleted successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.tableService.remove(id);
  }
}
