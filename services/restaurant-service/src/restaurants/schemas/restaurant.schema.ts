import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string; // URL-friendly identifier

  @Prop({ required: true })
  ownerName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({
    type: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      latitude: Number,
      longitude: Number,
    },
    required: true,
  })
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };

  @Prop({
    type: {
      cuisine: [String],
      seatingCapacity: Number,
      hasOutdoorSeating: Boolean,
      hasParking: Boolean,
      isVegOnly: Boolean,
      isNonVegOnly: Boolean,
    },
  })
  details: {
    cuisine: string[];
    seatingCapacity?: number;
    hasOutdoorSeating?: boolean;
    hasParking?: boolean;
    isVegOnly?: boolean;
    isNonVegOnly?: boolean;
  };

  @Prop({
    type: {
      gstin: String,
      fssaiLicense: String,
      panNumber: String,
    },
  })
  businessInfo: {
    gstin?: string;
    fssaiLicense?: string;
    panNumber?: string;
  };

  @Prop({
    required: true,
    enum: ["active", "inactive", "suspended", "onboarding"],
    default: "onboarding",
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: "Subscription" })
  currentSubscription: string;

  @Prop({ default: 0 })
  totalOutlets: number;

  @Prop({ default: Date.now })
  onboardedAt: Date;

  @Prop()
  logoUrl: string;

  @Prop()
  website: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
