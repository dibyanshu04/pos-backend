import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KitchenDocument = Kitchen & Document;

@Schema({ timestamps: true })
export class Kitchen {
  @Prop({ type: String, required: true, index: true })
  restaurantId: string; // Reference to restaurant-service

  @Prop({ type: String, required: true, index: true })
  outletId: string; // Reference to outlet

  @Prop({ type: String, required: true })
  name: string; // Kitchen name (e.g., "Main Kitchen", "Bar", "Tandoor")

  @Prop({ type: String, required: true })
  code: string; // Kitchen code (e.g., "MAIN_KITCHEN", "BAR", "TANDOOR")

  @Prop({ type: Boolean, default: false, index: true })
  isDefault: boolean; // One default kitchen per outlet

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean; // Active/Inactive status

  // Future use: Printer mapping
  @Prop({ type: String })
  printerId?: string; // Reference to printer configuration
}

export const KitchenSchema = SchemaFactory.createForClass(Kitchen);

// Indexes for better query performance
KitchenSchema.index({ outletId: 1, isActive: 1 });
KitchenSchema.index({ outletId: 1, isDefault: 1 });
KitchenSchema.index({ restaurantId: 1, outletId: 1, code: 1 }, { unique: true });

