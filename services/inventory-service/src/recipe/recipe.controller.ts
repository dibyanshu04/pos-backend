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
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeStatusDto } from './dto/update-recipe-status.dto';
import { RecipeService } from './recipe.service';

@ApiTags('recipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create/replace recipe for a menu item (append-only pattern)',
    description:
      'Creates a new recipe and deactivates any existing active recipe for the same menu item and outlet. Recipes are immutable snapshots; edits create new documents.',
  })
  @ApiBody({ type: CreateRecipeDto })
  @ApiResponse({
    status: 201,
    description: 'Recipe created; previous active recipe (if any) deactivated',
    type: SuccessResponseDto,
  })
  async create(
    @Body() dto: CreateRecipeDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto<any>> {
    const userId = req.user?.id || req.user?.userId || 'system';
    dto.createdByUserId = dto.createdByUserId || userId;
    const recipe = await this.recipeService.create(dto);
    return new SuccessResponseDto(
      recipe,
      'Recipe created and previous active recipe deactivated',
    );
  }

  @Get('menu-item/:menuItemId')
  @Roles('OWNER', 'MANAGER', 'CHEF')
  @ApiOperation({
    summary: 'Get active recipe for a menu item (outlet-scoped)',
    description:
      'Returns the currently active recipe for the specified menu item and outlet. Snapshot is used by order-service during consumption.',
  })
  @ApiParam({ name: 'menuItemId', description: 'Menu item ID' })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findByMenuItem(
    @Param('menuItemId') menuItemId: string,
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any>> {
    const recipe = await this.recipeService.findByMenuItem(menuItemId, outletId);
    return new SuccessResponseDto(recipe, 'Active recipe retrieved');
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'CHEF')
  @ApiOperation({
    summary: 'List recipes for an outlet',
    description:
      'Returns all recipes (active/inactive) for an outlet. Historical recipes remain for audit/snapshots.',
  })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findAll(
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any[]>> {
    const recipes = await this.recipeService.findAll(outletId);
    return new SuccessResponseDto(recipes, 'Recipes retrieved');
  }

  @Put(':id/status')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({
    summary: 'Enable/disable a recipe (soft toggle)',
    description:
      'Soft toggle recipe. Enabling enforces single active recipe per menu item per outlet. No hard deletes.',
  })
  @ApiParam({ name: 'id', description: 'Recipe ID' })
  @ApiBody({ type: UpdateRecipeStatusDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRecipeStatusDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto<any>> {
    dto.updatedByUserId = dto.updatedByUserId || req.user?.id || req.user?.userId || 'system';
    const recipe = await this.recipeService.updateStatus(id, dto);
    return new SuccessResponseDto(
      recipe,
      dto.isActive ? 'Recipe activated' : 'Recipe deactivated',
    );
  }
}

