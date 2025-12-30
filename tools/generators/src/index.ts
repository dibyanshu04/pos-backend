#!/usr/bin/env node

import inquirer from 'inquirer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { TemplateEngine, TemplateContext } from './utils/template-engine';
import { FileWriter } from './utils/file-writer';
import { ModuleRegister } from './utils/module-register';
import { FieldDefinition, parseFieldType, getAllValidators } from './utils/field-parser';
import { toPascalCase, toCamelCase, toPlural, toDisplayName } from './utils/naming';

interface GeneratorOptions {
  serviceName: string;
  moduleName: string;
  fields: FieldDefinition[];
  hasRestaurantId: boolean;
  hasStatus: boolean;
  hasRank: boolean;
}

async function promptForService(): Promise<string> {
  const servicesDir = path.join(process.cwd(), 'services');
  const services = await fs.readdir(servicesDir);
  const validServices = services.filter((s) => {
    const servicePath = path.join(servicesDir, s);
    return fs.statSync(servicePath).isDirectory() && 
           fs.existsSync(path.join(servicePath, 'src', 'app.module.ts'));
  });

  const { serviceName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'serviceName',
      message: 'Select the service:',
      choices: validServices,
    },
  ]);

  return serviceName;
}

async function promptForModuleName(): Promise<string> {
  const { moduleName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'moduleName',
      message: 'Enter module name (e.g., promotions, discounts):',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Module name is required';
        }
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Module name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
        }
        return true;
      },
    },
  ]);

  return moduleName.trim().toLowerCase();
}

async function promptForFields(): Promise<FieldDefinition[]> {
  const fields: FieldDefinition[] = [];
  let addMore = true;

  while (addMore) {
    const fieldAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Field name:',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Field name is required';
          }
          if (!/^[a-z][a-zA-Z0-9]*$/.test(input)) {
            return 'Field name must start with a lowercase letter and contain only alphanumeric characters';
          }
          if (fields.some((f) => f.name === input)) {
            return 'Field name already exists';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Field type:',
        choices: [
          { name: 'String', value: 'string' },
          { name: 'Number', value: 'number' },
          { name: 'Boolean', value: 'boolean' },
          { name: 'Date', value: 'date' },
          { name: 'Enum', value: 'enum' },
          { name: 'Array', value: 'array' },
          { name: 'Object', value: 'object' },
        ],
      },
      {
        type: 'confirm',
        name: 'required',
        message: 'Is this field required?',
        default: true,
      },
      {
        type: 'input',
        name: 'default',
        message: 'Default value (optional, press Enter to skip):',
        when: (answers: any) => !answers.required,
      },
      {
        type: 'input',
        name: 'min',
        message: 'Minimum value (for numbers, press Enter to skip):',
        when: (answers: any) => answers.type === 'number',
        validate: (input: string) => {
          if (!input) return true;
          return !isNaN(Number(input)) || 'Must be a number';
        },
      },
      {
        type: 'input',
        name: 'enumValues',
        message: 'Enum values (comma-separated):',
        when: (answers: any) => answers.type === 'enum',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Enum values are required';
          }
          return true;
        },
      },
    ]);

    const field: FieldDefinition = {
      name: fieldAnswers.name,
      type: fieldAnswers.type,
      required: fieldAnswers.required,
      optional: !fieldAnswers.required,
      trim: fieldAnswers.type === 'string',
    };

    if (fieldAnswers.default) {
      field.default = fieldAnswers.default;
    }
    if (fieldAnswers.min) {
      field.min = Number(fieldAnswers.min);
    }
    if (fieldAnswers.enumValues) {
      field.enum = fieldAnswers.enumValues.split(',').map((v: string) => v.trim());
    }

    fields.push(field);

    const { continueAdding } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueAdding',
        message: 'Add another field?',
        default: true,
      },
    ]);

    addMore = continueAdding;
  }

  return fields;
}

async function promptForCommonFields(): Promise<{
  hasRestaurantId: boolean;
  hasStatus: boolean;
  hasRank: boolean;
}> {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasRestaurantId',
      message: 'Include restaurantId field?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'hasStatus',
      message: 'Include status field (Active/Inactive)?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'hasRank',
      message: 'Include rank field?',
      default: false,
    },
  ]);

  return answers;
}

function buildTemplateContext(options: GeneratorOptions): TemplateContext {
  const moduleName = options.moduleName;
  const entityName = toCamelCase(moduleName);
  const EntityName = toPascalCase(moduleName);
  const entityDisplayName = toDisplayName(moduleName);
  const EntityDisplayName = toPascalCase(moduleName);
  const entityDisplayNamePlural = toDisplayName(toPlural(moduleName));
  const EntityDisplayNamePlural = toPascalCase(toPlural(moduleName));
  const serviceClassName = `${EntityName}Service`;
  const ServiceClassName = serviceClassName;
  const controllerClassName = `${EntityName}Controller`;
  const ControllerClassName = controllerClassName;
  const moduleClassName = `${EntityName}Module`;
  const ModuleClassName = moduleClassName;
  const serviceInstanceName = toCamelCase(serviceClassName);
  const entityInstanceName = entityName;
  const entityInstanceNamePlural = toCamelCase(toPlural(moduleName));
  const modelInstanceName = `${entityName}Model`;

  // Process fields for templates
  const processedFields = options.fields.map((field) => {
    const { tsType, decorators } = parseFieldType(field);
    return {
      name: field.name,
      type: tsType.replace('?', ''), // Remove ? for template processing
      required: field.required,
      optional: !field.required,
      default: field.default,
      enum: field.enum,
      min: field.min,
      trim: field.trim,
      example: field.example,
      decorators: decorators.decorators,
    };
  });

  const validators = getAllValidators(options.fields);
  const nestedTypes = options.fields
    .filter((f) => f.nestedType)
    .map((f) => f.nestedType!)
    .filter((t, i, arr) => arr.indexOf(t) === i);

  return {
    moduleName,
    entityName,
    EntityName,
    entityDisplayName,
    EntityDisplayName,
    entityDisplayNamePlural,
    EntityDisplayNamePlural,
    serviceClassName,
    ServiceClassName,
    controllerClassName,
    ControllerClassName,
    moduleClassName,
    ModuleClassName,
    serviceInstanceName,
    entityInstanceName,
    entityInstanceNamePlural,
    modelInstanceName,
    hasRestaurantId: options.hasRestaurantId,
    hasStatus: options.hasStatus,
    hasRank: options.hasRank,
    fields: processedFields,
    validators,
    nestedTypes: nestedTypes.length > 0 ? nestedTypes : undefined,
    hasNestedTypes: nestedTypes.length > 0,
    indexes: [],
  };
}

async function generateModule(options: GeneratorOptions): Promise<void> {
  const servicePath = path.join(process.cwd(), 'services', options.serviceName);
  
  if (!(await fs.pathExists(servicePath))) {
    throw new Error(`Service path does not exist: ${servicePath}`);
  }

  const fileWriter = new FileWriter(servicePath, options.moduleName);
  const templateEngine = new TemplateEngine();
  const moduleRegister = new ModuleRegister(servicePath);

  const context = buildTemplateContext(options);

  console.log('\n📝 Generating files...\n');

  // Generate all files
  const controllerContent = await templateEngine.renderController(context);
  await fileWriter.writeController(controllerContent);
  console.log(`✓ Created ${options.moduleName}.controller.ts`);

  const serviceContent = await templateEngine.renderService(context);
  await fileWriter.writeService(serviceContent);
  console.log(`✓ Created ${options.moduleName}.service.ts`);

  const moduleContent = await templateEngine.renderModule(context);
  await fileWriter.writeModule(moduleContent);
  console.log(`✓ Created ${options.moduleName}.module.ts`);

  const schemaContent = await templateEngine.renderSchema(context);
  await fileWriter.writeSchema(schemaContent);
  console.log(`✓ Created schema/${options.moduleName}.schema.ts`);

  const createDtoContent = await templateEngine.renderCreateDto(context);
  await fileWriter.writeCreateDto(createDtoContent);
  console.log(`✓ Created dto/create-${options.moduleName}.dto.ts`);

  const updateDtoContent = await templateEngine.renderUpdateDto(context);
  await fileWriter.writeUpdateDto(updateDtoContent);
  console.log(`✓ Created dto/update-${options.moduleName}.dto.ts`);

  // Register module in app.module.ts
  const moduleImportPath = `./${options.moduleName}/${options.moduleName}.module`;
  await moduleRegister.registerModule(context.ModuleClassName, moduleImportPath);

  console.log('\n✅ Module generation complete!\n');
  console.log(`📍 Module location: ${fileWriter.getModulePath()}\n`);
}

async function main() {
  console.log('\n🚀 NestJS Module Generator\n');
  console.log('This tool will generate a complete NestJS module with:\n');
  console.log('  • Controller (with full Swagger docs)');
  console.log('  • Service (with CRUD operations)');
  console.log('  • Module');
  console.log('  • Schema (Mongoose)');
  console.log('  • DTOs (Create & Update)\n');

  try {
    // Get service name from args or prompt
    const args = process.argv.slice(2);
    let serviceName: string;
    let moduleName: string;

    if (args.length >= 2) {
      serviceName = args[0];
      moduleName = args[1];
    } else if (args.length === 1) {
      serviceName = args[0];
      moduleName = await promptForModuleName();
    } else {
      serviceName = await promptForService();
      moduleName = await promptForModuleName();
    }

    // Validate service exists
    const servicePath = path.join(process.cwd(), 'services', serviceName);
    if (!(await fs.pathExists(servicePath))) {
      throw new Error(`Service '${serviceName}' does not exist`);
    }

    // Check if module already exists
    const modulePath = path.join(servicePath, 'src', moduleName);
    if (await fs.pathExists(modulePath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Module '${moduleName}' already exists. Overwrite?`,
          default: false,
        },
      ]);
      if (!overwrite) {
        console.log('Generation cancelled.');
        process.exit(0);
      }
    }

    // Prompt for fields
    const fields = await promptForFields();
    const commonFields = await promptForCommonFields();

    const options: GeneratorOptions = {
      serviceName,
      moduleName,
      fields,
      ...commonFields,
    };

    await generateModule(options);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

