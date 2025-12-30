import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type {{EntityName}}Document = {{EntityName}} & Document;

@Schema({ timestamps: true })
export class {{EntityName}} {
  {{#each fields}}
  @Prop({{#if required}}{ required: true{{#if trim}}, trim: true{{/if}}{{#if default}}, default: {{{default}}}{{/if}}{{#if min}}, min: {{{min}}}{{/if}}{{#if enum}}, enum: [{{#each enum}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}]{{/if}} }{{else}}{ {{#if trim}}trim: true, {{/if}}{{#if default}}default: {{{default}}}, {{/if}}{{#if min}}min: {{{min}}}, {{/if}}{{#if enum}}enum: [{{#each enum}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}], {{/if}} }{{/if}})
  {{name}}: {{type}}{{#if optional}}?{{/if}};

  {{/each}}
  {{#if hasRestaurantId}}
  @Prop({ required: true, index: true })
  restaurantId: string;

  {{/if}}
  {{#if hasStatus}}
  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  {{/if}}
  {{#if hasRank}}
  @Prop({ default: 0, min: 0, index: true })
  rank: number;

  {{/if}}
}

export const {{EntityName}}Schema = SchemaFactory.createForClass({{EntityName}});

{{#if indexes}}
{{#each indexes}}
{{EntityName}}Schema.index({{{this}}});
{{/each}}
{{/if}}

