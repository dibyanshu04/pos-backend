import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserType } from 'src/users/schema/user.schema';
import { RolesService } from './roles.service';
import { Permissions, Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RoleScope } from './schema/role.schema';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles(UserType.PLATFORM)
  @Permissions('user:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: SuccessResponseDto,
  })
  async getAllRoles(): Promise<SuccessResponseDto<any>> {
    const roles = await this.rolesService.findAll();
    return new SuccessResponseDto(roles, 'Roles retrieved successfully');
  }

  @Get('platform')
  @ApiOperation({ summary: 'Get platform roles' })
  @ApiResponse({
    status: 200,
    description: 'Platform roles retrieved successfully',
    type: SuccessResponseDto,
  })
  async getPlatformRoles(): Promise<SuccessResponseDto<any>> {
    const roles = await this.rolesService.findByScope(RoleScope.PLATFORM);
    return new SuccessResponseDto(
      roles,
      'Platform roles retrieved successfully',
    );
  }

  @Get('restaurant')
  @ApiOperation({ summary: 'Get restaurant roles' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant roles retrieved successfully',
    type: SuccessResponseDto,
  })
  async getRestaurantRoles(
    @CurrentUser() user: any,
  ): Promise<SuccessResponseDto<any>> {
    // Optional: filter by restaurantId from current user
    const roles = await this.rolesService.findByScope(RoleScope.RESTAURANT);
    return new SuccessResponseDto(
      roles,
      'Restaurant roles retrieved successfully',
    );
  }

  @Get(':id')
  @Roles(UserType.PLATFORM)
  @Permissions('user:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: SuccessResponseDto,
  })
  async getRoleById(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const role = await this.rolesService.findById(id);
    return new SuccessResponseDto(role, 'Role retrieved successfully');
  }

  @Post()
  @Roles(UserType.PLATFORM, UserType.RESTAURANT)
  @Permissions('user:write', 'roles:write')
  @ApiOperation({ summary: 'Create new role' })
  @ApiBody({
    schema: {
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        scope: { type: 'string', enum: ['platform', 'restaurant'] },
        permissions: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: SuccessResponseDto,
  })
  async createRole(
    @CurrentUser() user: any,
    @Body() createRoleDto: any,
  ): Promise<SuccessResponseDto<any>> {
    // If restaurant-scoped, attach restaurantId from current user
    if (
      createRoleDto.scope === RoleScope.RESTAURANT &&
      user.userType === UserType.RESTAURANT
    ) {
      const firstAccess = user.restaurantAccess?.[0];
      createRoleDto.restaurantId = firstAccess?.restaurantId;
    }

    const role = await this.rolesService.create(createRoleDto);
    return new SuccessResponseDto(role, 'Role created successfully');
  }

  @Put(':id')
  @Roles(UserType.PLATFORM, UserType.RESTAURANT)
  @Permissions('user:write', 'roles:write')
  @ApiOperation({ summary: 'Update role' })
  @ApiBody({
    schema: {
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: SuccessResponseDto,
  })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: any,
  ): Promise<SuccessResponseDto<any>> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return new SuccessResponseDto(role, 'Role updated successfully');
  }

}
