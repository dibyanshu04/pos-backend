import { ApiProperty } from '@nestjs/swagger';
import {
  
  IsOptional
  
} from 'class-validator';


export class CreateTaxesDto {
  
  @ApiProperty( }{{else}}{  }{{/if}})
  
  {{name}}: {{type}};

  {{/each}}
  
  @ApiProperty()
  @IsString()
  restaurantId: string;

  
  
  @ApiProperty({
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: string;

  
  
}

