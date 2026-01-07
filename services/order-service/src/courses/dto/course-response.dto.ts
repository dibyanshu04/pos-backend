import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty({ description: 'Course ID' })
  _id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  restaurantId: string;

  @ApiProperty({ description: 'Outlet ID' })
  outletId: string;

  @ApiProperty({ description: 'Course name', example: 'Starter' })
  name: string;

  @ApiProperty({ description: 'Course code', example: 'STARTER' })
  code: string;

  @ApiProperty({ description: 'Serving sequence', example: 1 })
  sequence: number;

  @ApiProperty({ description: 'Whether this is the default course', example: false })
  isDefault: boolean;

  @ApiProperty({ description: 'Whether the course is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

