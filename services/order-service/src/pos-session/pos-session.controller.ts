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
import { PosSessionService } from './pos-session.service';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { SessionFilterDto } from './dto/session-filter.dto';
import { SessionSummaryDto } from './dto/session-summary.dto';
import { SuccessResponseDto } from '../orders/dto/success-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('pos-sessions')
@Controller('pos-sessions')
@ApiBearerAuth()
export class PosSessionController {
  constructor(private readonly posSessionService: PosSessionService) {}

  @Post('open')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Open a new POS Session',
    description:
      'Opens a new POS session for an outlet. Only one active session per outlet is allowed.',
  })
  @ApiBody({ type: OpenSessionDto })
  @ApiResponse({
    status: 201,
    description: 'POS Session opened successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Active session already exists or validation failed',
  })
  async openSession(
    @Body() openSessionDto: OpenSessionDto,
    @CurrentUser() user: any,
  ): Promise<SuccessResponseDto<any>> {
    const session = await this.posSessionService.openSession(
      openSessionDto,
      user.userId || user._id || user.id,
    );
    return new SuccessResponseDto(
      session,
      'POS Session opened successfully',
    );
  }

  @Post('close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Close a POS Session',
    description:
      'Closes an active POS session. Validates that all orders are settled before closing.',
  })
  @ApiBody({ type: CloseSessionDto })
  @ApiResponse({
    status: 200,
    description: 'POS Session closed successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Session has unsettled orders or validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'POS Session not found',
  })
  async closeSession(
    @Body() closeSessionDto: CloseSessionDto,
    @CurrentUser() user: any,
  ): Promise<SuccessResponseDto<any>> {
    const session = await this.posSessionService.closeSession(
      closeSessionDto,
      user.userId || user._id || user.id,
    );
    return new SuccessResponseDto(
      session,
      'POS Session closed successfully',
    );
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active POS Session for an outlet',
    description: 'Returns the currently active POS session for a given outlet',
  })
  @ApiQuery({
    name: 'outletId',
    required: true,
    description: 'Outlet ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Active session retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No active session found for this outlet',
  })
  async getActiveSession(
    @Query('outletId') outletId: string,
  ): Promise<SuccessResponseDto<any>> {
    const session = await this.posSessionService.findActiveSession(outletId);
    if (!session) {
      return new SuccessResponseDto(
        null,
        'No active session found for this outlet',
      );
    }
    return new SuccessResponseDto(
      session,
      'Active session retrieved successfully',
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all POS Sessions',
    description:
      'Retrieves all POS sessions with optional filters (outlet, date range, status, etc.)',
  })
  @ApiQuery({ name: 'outletId', required: false, type: String })
  @ApiQuery({ name: 'restaurantId', required: false, type: String })
  @ApiQuery({ name: 'openedByUserId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['OPEN', 'CLOSED'],
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'POS Sessions retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    @Query() filters: SessionFilterDto,
  ): Promise<SuccessResponseDto<any[]>> {
    const sessions = await this.posSessionService.findAll(filters);
    return new SuccessResponseDto(
      sessions,
      'POS Sessions retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get POS Session by ID',
    description: 'Retrieves a specific POS session by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'POS Session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'POS Session retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'POS Session not found',
  })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const session = await this.posSessionService.findOne(id);
    return new SuccessResponseDto(
      session,
      'POS Session retrieved successfully',
    );
  }

  @Get('summary/:id')
  @ApiOperation({
    summary: 'Get detailed summary of a POS Session',
    description:
      'Returns a detailed summary including financial breakdown, order counts, and duration',
  })
  @ApiParam({
    name: 'id',
    description: 'POS Session ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Session summary retrieved successfully',
    type: SessionSummaryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'POS Session not found',
  })
  async getSummary(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<SessionSummaryDto>> {
    const summary = await this.posSessionService.getSummary(id);
    return new SuccessResponseDto(
      summary,
      'Session summary retrieved successfully',
    );
  }
}

