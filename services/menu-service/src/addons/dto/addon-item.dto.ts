import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class AddonItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sapCode?: string;

  @ApiProperty({
    enum: ['Veg', 'Non-Veg', 'Egg'],
    default: 'Veg',
  })
  @IsOptional()
  @IsEnum(['Veg', 'Non-Veg', 'Egg'])
  attribute?: string;

  @ApiProperty({
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  available?: string;
}

