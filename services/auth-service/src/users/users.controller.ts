import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { UserType } from './schema/user.schema';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permissions, Roles } from 'src/common/decorators/roles.decorator';
import { RestaurantAccessGuard } from 'src/auth/guards/restaurant-access.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile from DB' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: SuccessResponseDto,
  })
  async getProfile(@CurrentUser() user: any): Promise<SuccessResponseDto<any>> {
    const userProfile: any = await this.usersService.findById(user.id);
    const { password: _, ...profile } = userProfile.toObject();
    return new SuccessResponseDto(profile, 'Profile retrieved successfully');
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserType.PLATFORM)
  @Permissions('user:read')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: SuccessResponseDto,
  })
  async getUserById(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const { password: _, ...userData } = user.toObject();
    return new SuccessResponseDto(userData, 'User retrieved successfully');
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserType.RESTAURANT)
  @Permissions('user:write')
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string' } } } })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: SuccessResponseDto,
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<SuccessResponseDto<any>> {
    const user: any = await this.usersService.updateUserStatus(id, status);
    const { password: _, ...userData } = user.toObject();
    return new SuccessResponseDto(userData, 'User status updated successfully');
  }

  @Put(':id/restaurant-access')
  @UseGuards(RolesGuard, RestaurantAccessGuard)
  @Roles(UserType.PLATFORM)
  @Permissions('user:write')
  @ApiOperation({ summary: 'Add restaurant access to user (Admin/Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    schema: {
      properties: {
        restaurantId: { type: 'string' },
        outletId: { type: 'string' },
        roleId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant access added successfully',
    type: SuccessResponseDto,
  })
  async addRestaurantAccess(
    @Param('id') id: string,
    @Body()
    accessData: {
      restaurantId: string;
      outletId?: string;
      roleId: string;
    },
  ): Promise<SuccessResponseDto<any>> {
    const user: any = await this.usersService.addRestaurantAccess(
      id,
      accessData,
    );
    const { password: _, ...userData } = user.toObject();
    return new SuccessResponseDto(
      userData,
      'Restaurant access added successfully',
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserType.PLATFORM)
  @Permissions('user:read')
  @ApiOperation({ summary: 'Get all users with filtering (Admin only)' })
  @ApiQuery({
    name: 'userType',
    required: false,
    description: 'Filter by user type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'restaurantId',
    required: false,
    description: 'Filter by restaurant',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: SuccessResponseDto,
  })
  async getUsers(
    @Query('userType') userType?: string,
    @Query('status') status?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<SuccessResponseDto<any>> {
    // TODO: implement proper filtered search
    const users = await this.usersService.findAllPlatformUsers();
    return new SuccessResponseDto(
      {
        users,
        pagination: {
          page,
          limit,
          total: users.length,
        },
      },
      'Users retrieved successfully',
    );
  }

  @Get('restaurant/:restaurantId/staff')
  @UseGuards(RolesGuard, RestaurantAccessGuard)
  @Roles(UserType.RESTAURANT)
  @Permissions('staff:read')
  @ApiOperation({ summary: 'Get all staff for a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant staff retrieved successfully',
    type: SuccessResponseDto,
  })
  async getRestaurantStaff(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any>> {
    const staff = await this.usersService.findAllRestaurantUsers(restaurantId);
    const staffWithoutPasswords = staff.map((user: any) => {
      const { password: _, ...userData } = user.toObject();
      return userData;
    });
    return new SuccessResponseDto(
      staffWithoutPasswords,
      'Restaurant staff retrieved successfully',
    );
  }
}
