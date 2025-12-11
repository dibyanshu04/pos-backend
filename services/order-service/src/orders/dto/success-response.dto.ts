import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  timestamp: string;

  constructor(data: T, message: string = 'Success') {
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
