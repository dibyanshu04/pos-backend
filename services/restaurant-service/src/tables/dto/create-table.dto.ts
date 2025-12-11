import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsNumber()
  @IsOptional()
  seatingCapacity?: number;

  @IsMongoId()
  @IsNotEmpty()
  outletId: string;
}
