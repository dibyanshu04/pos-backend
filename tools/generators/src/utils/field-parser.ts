export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'array' | 'object';
  required: boolean;
  optional?: boolean;
  default?: string | number | boolean;
  enum?: string[];
  min?: number;
  max?: number;
  trim?: boolean;
  example?: string | number | boolean;
  nestedType?: string;
}

export interface FieldDecorators {
  validators: string[];
  decorators: string[];
}

export function parseFieldType(field: FieldDefinition): {
  tsType: string;
  mongooseType: string;
  decorators: FieldDecorators;
} {
  const validators: string[] = [];
  const decorators: string[] = [];

  switch (field.type) {
    case 'string':
      validators.push('IsString');
      if (field.trim) {
        decorators.push('@IsString()');
      } else {
        decorators.push('@IsString()');
      }
      break;
    case 'number':
      validators.push('IsNumber');
      decorators.push('@IsNumber()');
      if (field.min !== undefined) {
        validators.push('Min');
        decorators.push(`@Min(${field.min})`);
      }
      if (field.max !== undefined) {
        validators.push('Max');
        decorators.push(`@Max(${field.max})`);
      }
      break;
    case 'boolean':
      validators.push('IsBoolean');
      decorators.push('@IsBoolean()');
      break;
    case 'date':
      validators.push('IsDateString');
      decorators.push('@IsDateString()');
      break;
    case 'enum':
      validators.push('IsEnum');
      decorators.push(`@IsEnum([${field.enum?.map(e => `'${e}'`).join(', ')}])`);
      break;
    case 'array':
      validators.push('IsArray');
      decorators.push('@IsArray()');
      if (field.nestedType) {
        validators.push('ValidateNested');
        decorators.push('@ValidateNested({ each: true })');
        decorators.push(`@Type(() => ${field.nestedType})`);
      }
      break;
    case 'object':
      validators.push('ValidateNested');
      decorators.push('@ValidateNested()');
      if (field.nestedType) {
        decorators.push(`@Type(() => ${field.nestedType})`);
      }
      break;
  }

  if (!field.required) {
    validators.push('IsOptional');
    decorators.unshift('@IsOptional()');
  }

  let tsType: string;
  let mongooseType: string = 'String';

  switch (field.type) {
    case 'string':
      tsType = 'string';
      mongooseType = 'String';
      break;
    case 'number':
      tsType = 'number';
      mongooseType = 'Number';
      break;
    case 'boolean':
      tsType = 'boolean';
      mongooseType = 'Boolean';
      break;
    case 'date':
      tsType = 'Date';
      mongooseType = 'Date';
      break;
    case 'enum':
      tsType = 'string';
      mongooseType = 'String';
      break;
    case 'array':
      if (field.nestedType) {
        tsType = `${field.nestedType}[]`;
        mongooseType = `[${field.nestedType}Schema]`;
      } else {
        tsType = 'any[]';
        mongooseType = '[String]';
      }
      break;
    case 'object':
      tsType = field.nestedType || 'any';
      mongooseType = field.nestedType ? `${field.nestedType}Schema` : 'Schema.Types.Mixed';
      break;
    default:
      tsType = 'any';
      mongooseType = 'String';
  }

  return {
    tsType: field.required ? tsType : `${tsType}?`,
    mongooseType,
    decorators: {
      validators: [...new Set(validators)],
      decorators,
    },
  };
}

export function getFieldDecorators(field: FieldDefinition): string[] {
  const { decorators } = parseFieldType(field);
  return decorators.decorators;
}

export function getAllValidators(fields: FieldDefinition[]): string[] {
  const allValidators = new Set<string>();
  fields.forEach((field) => {
    const result = parseFieldType(field);
    result.decorators.validators.forEach((v: string) => allValidators.add(v));
  });
  return Array.from(allValidators);
}

