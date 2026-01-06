import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRecipeStatusDto {
  @ApiProperty({
    description: 'Activate/deactivate recipe (soft toggle). Only one active recipe per menu item per outlet.',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    required: false,
    description: 'Audit user performing the status change',
    example: 'user-42',
  })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}

