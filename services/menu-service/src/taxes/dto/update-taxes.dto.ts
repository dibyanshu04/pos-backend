import { PartialType } from '@nestjs/swagger';
import { CreateTaxDto } from './create-taxes.dto';

export class UpdateTaxDto extends PartialType(CreateTaxDto) {}
