import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RawMaterialCategory } from '../enums/raw-material-category.enum';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { PurchaseUnitEnum } from 'src/common/units/purchase-unit.enum';

class CostingDto {
  @ApiProperty({
    description:
      'Average landed cost per base unit. Stored snapshot; updated by GRN/ledger later.',
    example: 320.5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  averageCost?: number = 0;

  @ApiProperty({
    description:
      'Last purchase landed cost per purchase unit (converted to base unit later).',
    example: 310,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lastPurchaseCost?: number = 0;
}

export class CreateRawMaterialDto {
  @ApiProperty({
    description: 'Restaurant identifier (multi-tenant boundary)',
    example: 'restaurant-123',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Outlet identifier (uniqueness scope for code & name)',
    example: 'outlet-789',
  })
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({
    description: 'Display name of the raw material',
    example: 'Paneer',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique code per outlet (e.g., RM_PANEER)',
    example: 'RM_PANEER',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    enum: RawMaterialCategory,
    description: 'Category used for grouping & reporting',
    example: RawMaterialCategory.DAIRY,
  })
  @IsEnum(RawMaterialCategory)
  category: RawMaterialCategory;

  @ApiProperty({
    enum: BaseUnitEnum,
    description:
      'Internal/base unit for consumption & costing. All math normalizes to this unit (GM/ML/PCS).',
    example: BaseUnitEnum.GM,
  })
  @IsEnum(BaseUnitEnum)
  baseUnit: BaseUnitEnum;

  @ApiProperty({
    enum: PurchaseUnitEnum,
    description:
      'Purchase unit (input unit). Must be compatible with baseUnit: KG→GM, LTR→ML, BOX/PACK/PCS→PCS.',
    example: PurchaseUnitEnum.KG,
  })
  @IsEnum(PurchaseUnitEnum)
  purchaseUnit: PurchaseUnitEnum;

  @ApiProperty({
    description:
      'Multiplier to convert purchaseUnit into baseUnit (quantity * conversionFactor). Example: 1 KG = 1000 GM => 1000. Must be > 0.',
    example: 1000,
    minimum: 0.0001,
  })
  @IsNumber()
  @Min(0.0001, { message: 'conversionFactor must be greater than 0' })
  conversionFactor: number;

  @ApiProperty({
    description: 'Whether the item is perishable (shelf life enforced)',
    example: true,
  })
  @IsBoolean()
  isPerishable: boolean;

  @ApiPropertyOptional({
    description:
      'Shelf life (in days). Mandatory when isPerishable = true. Leave empty otherwise.',
    example: 5,
  })
  @ValidateIf((o) => o.isPerishable === true)
  @IsNumber()
  @Min(1)
  shelfLifeInDays?: number;

  @ApiPropertyOptional({
    description: 'Costing snapshot. Values are stored only; ledger updates later.',
    type: CostingDto,
    default: { averageCost: 0, lastPurchaseCost: 0 },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CostingDto)
  costing?: CostingDto;

  @ApiPropertyOptional({
    description:
      'Audit field: user who created the raw material (future auth integration).',
    example: 'user-1',
  })
  @IsOptional()
  @IsString()
  createdByUserId?: string;

  @ApiPropertyOptional({
    description:
      'Audit field: user who last updated the raw material (future auth integration).',
    example: 'user-1',
  })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Active status. Defaults to true. Use status endpoint for soft delete.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

