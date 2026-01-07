import {
  Controller,
  Get,
  Post,
  Put,
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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { SuccessResponseDto } from '../orders/dto/success-response.dto';
// TODO: Add RBAC guards when auth-service integration is complete
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('courses')
@Controller('courses')
@ApiBearerAuth()
// TODO: Add RBAC when auth-service integration is complete
// @UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new course',
    description: 'Creates a new course. Requires OWNER or MANAGER role.',
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER')
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<SuccessResponseDto<CourseResponseDto>> {
    const course = await this.coursesService.create(createCourseDto);
    return new SuccessResponseDto(course, 'Course created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all courses for an outlet',
    description: 'Returns active courses by default. Use includeInactive=true to get all courses.',
  })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    description: 'Include inactive courses',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    type: [CourseResponseDto],
  })
  async findAll(
    @Query('outletId') outletId: string,
    @Query('includeInactive') includeInactive?: string,
  ): Promise<SuccessResponseDto<CourseResponseDto[]>> {
    if (!outletId) {
      throw new Error('outletId query parameter is required');
    }

    const courses =
      includeInactive === 'true'
        ? await this.coursesService.findAllByOutlet(outletId)
        : await this.coursesService.findByOutlet(outletId);

    return new SuccessResponseDto(courses, 'Courses retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<CourseResponseDto>> {
    const course = await this.coursesService.findOne(id);
    return new SuccessResponseDto(course, 'Course retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update course',
    description: 'Updates a course. Requires OWNER or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Course code conflict' })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<SuccessResponseDto<CourseResponseDto>> {
    const course = await this.coursesService.update(id, updateCourseDto);
    return new SuccessResponseDto(course, 'Course updated successfully');
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update course status (active/inactive)',
    description: 'Updates course active status. Cannot deactivate default course. Requires OWNER or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiBody({ type: UpdateCourseStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Course status updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate default course' })
  // TODO: Add RBAC when auth-service integration is complete
  // @Roles('OWNER', 'MANAGER')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCourseStatusDto,
  ): Promise<SuccessResponseDto<CourseResponseDto>> {
    const course = await this.coursesService.updateStatus(id, updateStatusDto);
    return new SuccessResponseDto(
      course,
      'Course status updated successfully',
    );
  }
}

