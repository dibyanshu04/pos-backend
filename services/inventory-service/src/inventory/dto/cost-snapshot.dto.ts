import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CostSnapshotDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  rawMaterialIds: string[];
}

