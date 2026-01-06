import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateVendorStatusDto {
  @ApiProperty({
    description: 'Activate/deactivate vendor',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;
}

