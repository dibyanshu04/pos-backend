import { ApiProperty } from '@nestjs/swagger';
import {
  {{#each validators}}
  {{this}}{{#unless @last}},{{/unless}}
  {{/each}}
} from 'class-validator';
{{#if hasNestedTypes}}
import { Type } from 'class-transformer';
{{#each nestedTypes}}
import { {{this}} } from './{{this}}';
{{/each}}
{{/if}}

export class Create{{EntityName}}Dto {
  {{#each fields}}
  @ApiProperty({{#if optional}}{ required: false{{#if default}}, default: {{{default}}}{{/if}}{{#if enum}}, enum: [{{#each enum}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}]{{/if}}{{#if example}}, example: {{{example}}}{{/if}} }{{else}}{ {{#if default}}default: {{{default}}}, {{/if}}{{#if enum}}enum: [{{#each enum}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}], {{/if}}{{#if example}}example: {{{example}}}, {{/if}} }{{/if}})
  {{#each decorators}}
  {{this}}
  {{/each}}
  {{name}}: {{type}};

  {{/each}}
  {{#if hasRestaurantId}}
  @ApiProperty()
  @IsString()
  restaurantId: string;

  {{/if}}
  {{#if hasStatus}}
  @ApiProperty({
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: string;

  {{/if}}
  {{#if hasRank}}
  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rank?: number;

  {{/if}}
}

