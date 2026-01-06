import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  // Restaurant and Outlet References
  @Prop({ type: String, required: true, index: true })
  restaurantId: string; // Reference to restaurant-service

  @Prop({ type: String, required: true, index: true })
  outletId: string; // Reference to outlet

  // Course Information
  @Prop({ type: String, required: true })
  name: string; // Course name (e.g., "Starter", "Main Course", "Dessert")

  @Prop({ type: String, required: true })
  code: string; // Course code (e.g., "STARTER", "MAIN_COURSE", "DESSERT", "DRINKS")

  @Prop({ type: Number, required: true, min: 1 })
  sequence: number; // Serving order (1 = first, 2 = second, etc.)

  @Prop({ type: Boolean, default: false, index: true })
  isDefault: boolean; // One default course per outlet (usually MAIN_COURSE)

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean; // Active/Inactive status
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Indexes for better query performance
CourseSchema.index({ outletId: 1, isActive: 1 });
CourseSchema.index({ outletId: 1, isDefault: 1 });
CourseSchema.index({ outletId: 1, sequence: 1 });
CourseSchema.index({ restaurantId: 1, outletId: 1, code: 1 }, { unique: true });

