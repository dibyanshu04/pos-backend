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
import { MenusService } from './menu.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiBody({ type: CreateMenuDto })
  @ApiResponse({
    status: 201,
    description: 'Menu created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  
  async create(
    @Body() createMenuDto: CreateMenuDto,
  ): Promise<SuccessResponseDto<any>> {
    const menu = await this.menusService.create(createMenuDto);
    return new SuccessResponseDto(menu, 'Menu created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all menus for an outlet' })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiResponse({
    status: 200,
    description: 'Menus retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const menus = await this.menusService.findAll(outletId);
    return new SuccessResponseDto(menus, 'Menus retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const menu = await this.menusService.findOne(id);
    return new SuccessResponseDto(menu, 'Menu retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiBody({ type: UpdateMenuDto })
  @ApiResponse({
    status: 200,
    description: 'Menu updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<SuccessResponseDto<any>> {
    const menu = await this.menusService.update(id, updateMenuDto);
    return new SuccessResponseDto(menu, 'Menu updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 204, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.menusService.remove(id);
  }

  @Get('outlet/:outletId/type/:type')
  @ApiOperation({ summary: 'Get menus by outlet and type' })
  @ApiParam({ name: 'outletId', description: 'Outlet ID' })
  @ApiParam({
    name: 'type',
    description: 'Menu type (base, zomato, swiggy, custom)',
  })
  @ApiResponse({
    status: 200,
    description: 'Menus retrieved by type',
    type: SuccessResponseDto,
  })
  async findByType(
    @Param('outletId') outletId: string,
    @Param('type') type: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const menus = await this.menusService.findByType(outletId, type);
    return new SuccessResponseDto(menus, 'Menus retrieved by type');
  }

  @Get('outlet/:outletId/base')
  @ApiOperation({ summary: 'Get base menu for an outlet' })
  @ApiParam({ name: 'outletId', description: 'Outlet ID' })
  @ApiResponse({
    status: 200,
    description: 'Base menu retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Base menu not found' })
  async getBaseMenu(
    @Param('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any>> {
    const menu = await this.menusService.getBaseMenu(outletId);
    return new SuccessResponseDto(menu, 'Base menu retrieved successfully');
  }

  @Post(':id/sync-with-base')
  @ApiOperation({ summary: 'Sync menu with its base menu' })
  @ApiParam({ name: 'id', description: 'Menu ID to sync' })
  @ApiResponse({
    status: 200,
    description: 'Menu synced with base menu successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Menu or base menu not found' })
  async syncWithBaseMenu(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const menu = await this.menusService.syncWithBaseMenu(id);
    return new SuccessResponseDto(
      menu,
      'Menu synced with base menu successfully',
    );
  }
}
