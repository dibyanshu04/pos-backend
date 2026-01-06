import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRawMaterialStatusDto {
  @ApiProperty({
    description: 'Flag to activate/deactivate the raw material (soft delete).',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    required: false,
    description: 'Audit user performing the status change.',
    example: 'user-42',
  })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}

