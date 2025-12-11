import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  // @Permissions("tables.create")
  create(@Body() dto: CreateTableDto) {
    return this.tableService.create(dto);
  }

  @Get()
  // @Permissions("tables.view")
  findAll(@Query('outletId') outletId: string) {
    return this.tableService.findAll(outletId);
  }

  @Get(':id')
  // @Permissions("tables.view")
  findOne(@Param('id') id: string) {
    return this.tableService.findOne(id);
  }

  @Patch(':id')
  // @Permissions("tables.update")
  update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.tableService.update(id, dto);
  }

  @Delete(':id')
  // @Permissions("tables.delete")
  remove(@Param('id') id: string) {
    return this.tableService.remove(id);
  }
}
