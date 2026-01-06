import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DayEndReportService } from './day-end-report.service';
import { GenerateZReportDto } from './dto/generate-z-report.dto';
import { XReportResponseDto } from './dto/x-report-response.dto';
import { ZReportResponseDto } from './dto/z-report-response.dto';
import { SuccessResponseDto } from '../orders/dto/success-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth-service/src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth-service/src/auth/guards/roles.guard';
import { RestaurantAccessGuard } from '../../auth-service/src/auth/guards/restaurant-access.guard';
import { Roles } from '../../auth-service/src/common/decorators/roles.decorator';
import { UserType } from '../../auth-service/src/users/schema/user.schema';

@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
export class DayEndReportController {
  constructor(private readonly dayEndReportService: DayEndReportService) {}

  @Get('x-report')
  @UseGuards(JwtAuthGuard, RolesGuard, RestaurantAccessGuard)
  @Roles(UserType.OWNER, UserType.MANAGER, UserType.CASHIER)
  @ApiOperation({
    summary: 'Generate X-Report (Interim Report)',
    description:
      'Generates an interim X-Report for the active POS session. This is a read-only snapshot computed on demand and does NOT close the session.',
  })
  @ApiQuery({
    name: 'outletId',
    required: true,
    description: 'Outlet ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'X-Report generated successfully',
    type: XReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No active POS session found',
  })
  async generateXReport(
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<XReportResponseDto>> {
    const report = await this.dayEndReportService.generateXReport(outletId);
    return new SuccessResponseDto(
      report,
      'X-Report generated successfully',
    );
  }

  @Post('z-report')
  @UseGuards(JwtAuthGuard, RolesGuard, RestaurantAccessGuard)
  @Roles(UserType.OWNER, UserType.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate Z-Report (Final Day-End Report)',
    description:
      'Generates a final Z-Report for the active POS session. This closes the session, locks all orders, and creates an immutable financial record. Can only be generated once per session.',
  })
  @ApiBody({ type: GenerateZReportDto })
  @ApiResponse({
    status: 201,
    description: 'Z-Report generated successfully',
    type: ZReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Z-Report already exists, pending orders, or validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'No active POS session found',
  })
  async generateZReport(
    @Body() generateZReportDto: GenerateZReportDto,
    @CurrentUser() user: any,
  ): Promise<SuccessResponseDto<ZReportResponseDto>> {
    const userId = user?.userId || user?._id || user?.id;
    const report = await this.dayEndReportService.generateZReport(
      generateZReportDto,
      userId,
    );
    return new SuccessResponseDto(
      report,
      'Z-Report generated successfully. POS Session has been closed.',
    );
  }

  @Get('z-report/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, RestaurantAccessGuard)
  @Roles(UserType.OWNER, UserType.MANAGER, UserType.CASHIER)
  @ApiOperation({
    summary: 'Get Z-Report by ID',
    description: 'Retrieves a specific Z-Report by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Z-Report ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Z-Report retrieved successfully',
    type: ZReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Z-Report not found',
  })
  async getZReportById(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<ZReportResponseDto>> {
    const report = await this.dayEndReportService.findZReportById(id);
    return new SuccessResponseDto(
      report,
      'Z-Report retrieved successfully',
    );
  }

  @Get('z-report')
  @UseGuards(JwtAuthGuard, RolesGuard, RestaurantAccessGuard)
  @Roles(UserType.OWNER, UserType.MANAGER, UserType.CASHIER)
  @ApiOperation({
    summary: 'Get Z-Reports with filters',
    description:
      'Retrieves Z-Reports with optional filters (outlet, restaurant, date)',
  })
  @ApiQuery({ name: 'outletId', required: false, type: String })
  @ApiQuery({ name: 'restaurantId', required: false, type: String })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Date filter (ISO 8601 format, e.g., 2024-01-15)',
  })
  @ApiResponse({
    status: 200,
    description: 'Z-Reports retrieved successfully',
    type: SuccessResponseDto,
  })
  async getZReports(
    @Query('outletId') outletId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('date') date?: string,
  ): Promise<SuccessResponseDto<ZReportResponseDto[]>> {
    const reports = await this.dayEndReportService.findZReports({
      outletId,
      restaurantId,
      date,
    });
    return new SuccessResponseDto(
      reports,
      'Z-Reports retrieved successfully',
    );
  }
}

