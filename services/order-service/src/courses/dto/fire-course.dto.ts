import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class FireCourseDto {
  @ApiProperty({
    description: 'Course code to fire (e.g., "MAIN_COURSE", "DESSERT")',
    example: 'MAIN_COURSE',
  })
  @IsString()
  @IsNotEmpty()
  courseCode: string;
}

