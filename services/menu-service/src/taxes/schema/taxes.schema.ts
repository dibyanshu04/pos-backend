import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaxesDocument = Taxes & Document;

@Schema({ timestamps: true })
export class Taxes {
  
  @Prop( }{{else}}{  }{{/if}})
  {{name}}: {{type}};

  {{/each}}
  
  @Prop({ required: true, index: true })
  restaurantId: string;

  
  
  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  
  
}

export const TaxesSchema = SchemaFactory.createForClass(Taxes);





