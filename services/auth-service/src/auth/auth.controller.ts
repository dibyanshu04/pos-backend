import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPlatformUserDto } from './dto/register-platform-user.dto';
import { RegisterRestaurantUserDto } from './dto/register-restaurant-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserType } from 'src/users/schema/user.schema';
import { Roles, Permissions } from 'src/common/decorators/roles.decorator';
import { RestaurantAccessGuard } from './guards/restaurant-access.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<SuccessResponseDto<any>> {
    const result = await this.authService.login(loginDto);
    return new SuccessResponseDto(result, 'Login successful');
  }

  @Post('register/platform')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register platform user (Admin, Support, etc.)' })
  @ApiBody({ type: RegisterPlatformUserDto })
  @ApiResponse({
    status: 201,
    description: 'Platform user registered successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerPlatformUser(
    @Body() registerDto: RegisterPlatformUserDto,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.authService.registerPlatformUser(registerDto);
    return new SuccessResponseDto(
      result,
      'Platform user registered successfully',
    );
  }

  @Post('register/restaurant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register restaurant user (Owner, Manager, Staff)' })
  @ApiBody({ type: RegisterRestaurantUserDto })
  @ApiResponse({
    status: 201,
    description: 'Restaurant user registered successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerRestaurantUser(
    @Body() registerDto: RegisterRestaurantUserDto,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.authService.registerRestaurantUser(registerDto);
    return new SuccessResponseDto(
      result,
      'Restaurant user registered successfully',
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return new SuccessResponseDto(result, 'Token refreshed successfully');
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    type: SuccessResponseDto,
  })
  async forgotPassword(
    @Body('email') email: string,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.authService.requestPasswordReset(email);
    return new SuccessResponseDto(result, 'Password reset email sent');
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({
    schema: {
      properties: {
        token: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: SuccessResponseDto,
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.authService.resetPassword(token, newPassword);
    return new SuccessResponseDto(result, 'Password reset successfully');
  }

  @Put('password/change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (authenticated users)' })
  @ApiBody({
    schema: {
      properties: {
        oldPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: SuccessResponseDto,
  })
  async changePassword(
    @CurrentUser() user: any,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.authService.changePassword(
      user.id,
      oldPassword,
      newPassword,
    );
    return new SuccessResponseDto(result, 'Password changed successfully');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (from JWT payload)' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: SuccessResponseDto,
  })
  async getProfile(@CurrentUser() user: any): Promise<SuccessResponseDto<any>> {
    return new SuccessResponseDto(user, 'Profile retrieved successfully');
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    type: SuccessResponseDto,
  })
  async validateToken(): Promise<SuccessResponseDto<any>> {
    return new SuccessResponseDto(null, 'Token is valid');
  }

  @Get('platform/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PLATFORM)
  @Permissions('user:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all platform users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform users retrieved successfully',
    type: SuccessResponseDto,
  })
  async getPlatformUsers(): Promise<SuccessResponseDto<any>> {
    // TODO: usersService.findAllPlatformUsers()
    return new SuccessResponseDto([], 'Platform users retrieved successfully');
  }

  @Get('restaurant/:restaurantId/users')
  @UseGuards(JwtAuthGuard, RolesGuard, RestaurantAccessGuard)
  @Roles(UserType.RESTAURANT)
  @Permissions('staff:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users for a restaurant' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant users retrieved successfully',
    type: SuccessResponseDto,
  })
  async getRestaurantUsers(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SuccessResponseDto<any>> {
    // TODO: usersService.findAllRestaurantUsers(restaurantId)
    return new SuccessResponseDto(
      [],
      'Restaurant users retrieved successfully',
    );
  }
}
