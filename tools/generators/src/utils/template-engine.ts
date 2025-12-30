import * as fs from 'fs-extra';
import * as path from 'path';

// Type declaration for CommonJS __dirname (available at runtime)
declare const __dirname: string;

export interface TemplateContext {
  moduleName: string;
  entityName: string;
  EntityName: string;
  entityDisplayName: string;
  EntityDisplayName: string;
  entityDisplayNamePlural: string;
  EntityDisplayNamePlural: string;
  serviceClassName: string;
  ServiceClassName: string;
  controllerClassName: string;
  ControllerClassName: string;
  moduleClassName: string;
  ModuleClassName: string;
  serviceInstanceName: string;
  entityInstanceName: string;
  entityInstanceNamePlural: string;
  modelInstanceName: string;
  hasRestaurantId: boolean;
  hasStatus: boolean;
  hasRank: boolean;
  fields: any[];
  validators?: string[];
  nestedTypes?: string[];
  hasNestedTypes?: boolean;
  indexes?: string[];
}

export class TemplateEngine {
  private templateDir: string;

  constructor() {
    // Resolve template directory relative to this utility file
    // Templates are in: tools/generators/src/templates/
    // This file is in: tools/generators/src/utils/
    // So we go up one level and into templates
    
    // __dirname is available in CommonJS (our tsconfig uses commonjs)
    // Resolve template directory relative to this utility file
    this.templateDir = path.join(__dirname, '../templates');
  }

  async renderTemplate(
    templateName: string,
    context: TemplateContext,
  ): Promise<string> {
    const templatePath = path.join(
      this.templateDir,
      `${templateName}.template.ts`,
    );
    let template = await fs.readFile(templatePath, 'utf-8');

    // Handle loops first (before variable replacement)
    template = template.replace(
      /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match: string, arrayName: string, content: string) => {
        const array = (context as any)[arrayName];
        if (!Array.isArray(array)) return '';
        return array
          .map((item: any, index: number) => {
            let itemContent = content;
            // Replace {{this}} with item value
            itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
            // Replace {{name}} with item.name, etc.
            if (typeof item === 'object') {
              Object.keys(item).forEach((key) => {
                const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                const value = item[key];
                if (value !== undefined) {
                  if (Array.isArray(value)) {
                    itemContent = itemContent.replace(regex, value.join(', '));
                  } else {
                    itemContent = itemContent.replace(regex, String(value));
                  }
                }
              });
            }
            // Handle {{#unless @last}}
            itemContent = itemContent.replace(
              /\{\{#unless @last\}\}([\s\S]*?)\{\{\/unless\}\}/g,
              (m: string, c: string) => (index < array.length - 1 ? c : ''),
            );
            return itemContent;
          })
          .join('');
      },
    );

    // Handle conditional blocks {{#if condition}}...{{/if}}
    template = template.replace(
      /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match: string, condition: string, content: string) => {
        const value = (context as any)[condition];
        return value ? content : '';
      },
    );

    // Replace {{variable}} with context values
    template = template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
      const value = (context as any)[key];
      if (value === undefined) return match;
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });

    return template;
  }

  async renderController(context: TemplateContext): Promise<string> {
    return this.renderTemplate('controller', context);
  }

  async renderService(context: TemplateContext): Promise<string> {
    return this.renderTemplate('service', context);
  }

  async renderModule(context: TemplateContext): Promise<string> {
    return this.renderTemplate('module', context);
  }

  async renderSchema(context: TemplateContext): Promise<string> {
    return this.renderTemplate('schema', context);
  }

  async renderCreateDto(context: TemplateContext): Promise<string> {
    return this.renderTemplate('create-dto', context);
  }

  async renderUpdateDto(context: TemplateContext): Promise<string> {
    return this.renderTemplate('update-dto', context);
  }
}

