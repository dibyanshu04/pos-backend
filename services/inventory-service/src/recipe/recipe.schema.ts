import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';

export type RecipeDocument = Recipe & Document;

export class RecipeComponent {
  @Prop({ type: Types.ObjectId, ref: 'RawMaterial', required: true })
  rawMaterialId: Types.ObjectId;

  @Prop({ type: String, required: true })
  rawMaterialName: string;

  @Prop({ type: Number, required: true, min: 0.0001 })
  quantityPerUnit: number; // In base unit

  @Prop({ type: String, enum: BaseUnitEnum, required: true })
  unit: BaseUnitEnum; // Always base unit
}

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ type: String, required: true, index: true })
  restaurantId: string;

  @Prop({ type: String, required: true, index: true })
  outletId: string;

  @Prop({ type: String, required: true, index: true })
  menuItemId: string;

  @Prop({ type: String, required: true })
  menuItemName: string; // Snapshot

  @Prop({ type: [RecipeComponent], required: true })
  components: RecipeComponent[];

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: String })
  createdByUserId?: string;

  @Prop({ type: String })
  updatedByUserId?: string;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

RecipeSchema.index({ outletId: 1, menuItemId: 1, isActive: 1 });
RecipeSchema.index({ outletId: 1, isActive: 1 });

