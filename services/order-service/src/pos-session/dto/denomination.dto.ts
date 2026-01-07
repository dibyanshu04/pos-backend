import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DenominationDto {
  @ApiProperty({
    description: 'Denomination value (supported: 1, 2, 5, 10, 20, 50, 100, 200, 500, 2000)',
    example: 500,
    enum: [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000],
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Number of notes/coins of this denomination',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  count: number;
}

export class CashDrawerDto {
  @ApiProperty({
    description: 'Array of denominations with counts',
    type: [DenominationDto],
    example: [
      { value: 500, count: 10 },
      { value: 100, count: 5 },
      { value: 50, count: 20 },
    ],
  })
  denominations: DenominationDto[];
}

