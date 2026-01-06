import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';
import { CourseResponseDto } from './dto/course-response.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  /**
   * Create a new course
   * Ensures only one default course per outlet
   */
  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    // Check if code already exists for this outlet
    const existingCourse = await this.courseModel.findOne({
      outletId: createCourseDto.outletId,
      code: createCourseDto.code,
    });

    if (existingCourse) {
      throw new ConflictException(
        `Course with code ${createCourseDto.code} already exists for this outlet`,
      );
    }

    // If setting as default, unset other default courses for this outlet
    if (createCourseDto.isDefault) {
      await this.courseModel.updateMany(
        { outletId: createCourseDto.outletId, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    const course = new this.courseModel({
      ...createCourseDto,
      isDefault: createCourseDto.isDefault ?? false,
      isActive: createCourseDto.isActive ?? true,
    });

    const savedCourse = await course.save();
    return this.toResponseDto(savedCourse);
  }

  /**
   * Find all active courses for an outlet
   */
  async findByOutlet(outletId: string): Promise<CourseResponseDto[]> {
    const courses = await this.courseModel
      .find({ outletId, isActive: true })
      .sort({ sequence: 1 })
      .exec();

    return courses.map((course) => this.toResponseDto(course));
  }

  /**
   * Find all courses (including inactive) for an outlet
   */
  async findAllByOutlet(outletId: string): Promise<CourseResponseDto[]> {
    const courses = await this.courseModel
      .find({ outletId })
      .sort({ sequence: 1 })
      .exec();

    return courses.map((course) => this.toResponseDto(course));
  }

  /**
   * Find course by ID
   */
  async findOne(id: string): Promise<CourseResponseDto> {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.toResponseDto(course);
  }

  /**
   * Find course by code and outlet
   */
  async findByCodeAndOutlet(
    code: string,
    outletId: string,
  ): Promise<CourseDocument | null> {
    return this.courseModel
      .findOne({ code, outletId, isActive: true })
      .exec();
  }

  /**
   * Get default course for an outlet
   */
  async findDefaultCourse(outletId: string): Promise<CourseDocument | null> {
    return this.courseModel
      .findOne({ outletId, isDefault: true, isActive: true })
      .exec();
  }

  /**
   * Validate course exists, is active, and belongs to the same outlet
   */
  async validateCourse(
    courseId: string,
    outletId: string,
  ): Promise<CourseDocument> {
    const course = await this.courseModel
      .findOne({ _id: courseId, outletId, isActive: true })
      .exec();

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found or inactive for outlet ${outletId}`,
      );
    }

    return course;
  }

  /**
   * Update course
   */
  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // If updating code, check for conflicts
    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const existingCourse = await this.courseModel.findOne({
        outletId: course.outletId,
        code: updateCourseDto.code,
        _id: { $ne: id },
      });

      if (existingCourse) {
        throw new ConflictException(
          `Course with code ${updateCourseDto.code} already exists for this outlet`,
        );
      }
    }

    // If setting as default, unset other default courses
    if (updateCourseDto.isDefault === true) {
      await this.courseModel.updateMany(
        { outletId: course.outletId, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } },
      );
    }

    // Update course
    Object.assign(course, updateCourseDto);
    const updatedCourse = await course.save();

    return this.toResponseDto(updatedCourse);
  }

  /**
   * Update course status (active/inactive)
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateCourseStatusDto,
  ): Promise<CourseResponseDto> {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Prevent deactivating default course
    if (!updateStatusDto.isActive && course.isDefault) {
      throw new BadRequestException(
        'Cannot deactivate default course. Please set another course as default first.',
      );
    }

    course.isActive = updateStatusDto.isActive;
    const updatedCourse = await course.save();

    return this.toResponseDto(updatedCourse);
  }

  /**
   * Convert course document to response DTO
   */
  private toResponseDto(course: CourseDocument): CourseResponseDto {
    return {
      _id: course._id.toString(),
      restaurantId: course.restaurantId,
      outletId: course.outletId,
      name: course.name,
      code: course.code,
      sequence: course.sequence,
      isDefault: course.isDefault,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}

