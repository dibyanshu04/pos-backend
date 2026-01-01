import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaxDocument = Tax & Document;

@Schema({ timestamps: true })
export class Tax {
  // Basic Information
  @Prop({ required: true, trim: true })
  name: string; // e.g., "GST 18%", "Service Charge", "CGST 9%"

  @Prop({ trim: true })
  description?: string; // Optional description

  @Prop({ trim: true })
  taxCode?: string; // Tax identification code (e.g., "GST", "VAT", "SERVICE")

  // Restaurant Scope
  @Prop({ required: true, index: true })
  restaurantId: string; // Restaurant-level tax

  @Prop({ type: [String], default: [] })
  outletIds?: string[]; // Optional: specific outlets (empty = all outlets)

  // Tax Type & Calculation
  @Prop({
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    required: true,
    default: 'PERCENTAGE',
  })
  taxType: 'PERCENTAGE' | 'FIXED'; // Percentage or fixed amount

  @Prop({ required: true, min: 0 })
  value: number; // Percentage (0-100) or fixed amount (>= 0)

  // GST Slab Support (Petpooja style)
  @Prop({
    type: String,
    enum: ['GST_SLAB', 'VAT', 'OTHER'],
    default: 'OTHER',
  })
  taxCategory?: 'GST_SLAB' | 'VAT' | 'OTHER'; // GST Slab, VAT, or Other

  @Prop({
    type: String,
    enum: ['FORWARD', 'BACKWARD'],
    default: 'FORWARD',
  })
  calculationType?: 'FORWARD' | 'BACKWARD'; // Forward or Backward calculation

  @Prop({ type: [String], default: [] })
  applicableOrderTypes?: string[]; // ['Delivery', 'Pick Up', 'Dine In']

  @Prop({ default: false })
  isMandatory?: boolean; // Cannot be removed even if user has rights

  @Prop({ trim: true })
  cgstSapCode?: string; // CGST SAP Code

  @Prop({ trim: true })
  sgstSapCode?: string; // SGST SAP Code

  @Prop({ trim: true })
  taxTitle?: string; // Custom tax title for display (e.g., "CGST", "SGST")

  @Prop({ default: false })
  excludeFromEcommerce?: boolean; // Do not print e-Commerce operators

  // Tax Inclusion
  @Prop({
    type: String,
    enum: ['INCLUSIVE', 'EXCLUSIVE'],
    required: true,
    default: 'EXCLUSIVE',
  })
  inclusionType: 'INCLUSIVE' | 'EXCLUSIVE'; // Inclusive or Exclusive

  // Applicable Scope
  @Prop({
    type: String,
    enum: ['ITEM', 'CATEGORY', 'BILL'],
    required: true,
    default: 'ITEM',
  })
  scope: 'ITEM' | 'CATEGORY' | 'BILL'; // Where tax applies

  // Scope-specific References
  @Prop({ type: [String], default: [] })
  itemIds?: string[]; // For ITEM scope: specific items (empty = all items)

  @Prop({ type: [String], default: [] })
  categoryIds?: string[]; // For CATEGORY scope: specific categories (empty = all categories)

  @Prop({ type: [String], default: [] })
  excludedItemIds?: string[]; // Items to exclude from tax

  @Prop({ type: [String], default: [] })
  excludedCategoryIds?: string[]; // Categories to exclude from tax

  // Priority & Application
  @Prop({ required: true, default: 0, min: 0, index: true })
  priority: number; // Lower number = higher priority (0 = highest)

  @Prop({ default: true })
  isActive: boolean; // Enable/disable tax

  // Additional Configuration
  @Prop({ default: false })
  isCompound: boolean; // If true, tax is calculated on base + previous taxes

  @Prop({ default: false })
  isRoundOff: boolean; // Round off tax amount

  @Prop({
    type: String,
    enum: ['ROUND_UP', 'ROUND_DOWN', 'ROUND_NEAREST'],
    default: 'ROUND_NEAREST',
  })
  roundOffMethod?: 'ROUND_UP' | 'ROUND_DOWN' | 'ROUND_NEAREST';

  // Display & Reporting
  @Prop({ default: true })
  showOnBill: boolean; // Display on bill/receipt

  @Prop({ default: true })
  showOnMenu: boolean; // Display on menu (for online)

  @Prop({ trim: true })
  displayName?: string; // Custom display name on bill

  // Status
  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  // Metadata
  @Prop({ default: 0, index: true })
  rank: number; // Display order

  // GST Slab Parent Reference (for CGST/SGST pairs)
  @Prop({ type: String })
  parentGstSlabId?: string; // Reference to parent GST Slab if this is CGST/SGST

  @Prop({
    type: String,
    enum: ['CGST', 'SGST'],
  })
  gstComponent?: 'CGST' | 'SGST'; // Component type if part of GST Slab
}

export const TaxSchema = SchemaFactory.createForClass(Tax);

// Indexes for efficient queries
TaxSchema.index({ restaurantId: 1, isActive: 1 });
TaxSchema.index({ restaurantId: 1, scope: 1, isActive: 1 });
TaxSchema.index({ restaurantId: 1, priority: 1 });
TaxSchema.index({ itemIds: 1 });
TaxSchema.index({ categoryIds: 1 });
TaxSchema.index({ outletIds: 1 });
