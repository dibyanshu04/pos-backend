import {
  IsMongoId,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class UpdateTableDto {
  @IsString()
  @IsOptional()
  tableNumber?: string;

  @IsNumber()
  @IsOptional()
  seatingCapacity?: number;

  @IsEnum(['available', 'occupied', 'reserved', 'closed'])
  @IsOptional()
  status?: string;
}
