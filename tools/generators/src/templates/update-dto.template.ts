import { PartialType } from '@nestjs/swagger';
import { Create{{EntityName}}Dto } from './create-{{moduleName}}.dto';

export class Update{{EntityName}}Dto extends PartialType(Create{{EntityName}}Dto) {}

