import * as fs from 'fs-extra';
import * as path from 'path';
import * as prettier from 'prettier';

export class FileWriter {
  private servicePath: string;
  private modulePath: string;

  constructor(servicePath: string, moduleName: string) {
    this.servicePath = servicePath;
    this.modulePath = path.join(servicePath, 'src', moduleName);
  }

  async ensureDirectory(dir: string): Promise<void> {
    await fs.ensureDir(dir);
  }

  async writeFile(
    relativePath: string,
    content: string,
    format: boolean = true,
  ): Promise<void> {
    const fullPath = path.join(this.modulePath, relativePath);
    await this.ensureDirectory(path.dirname(fullPath));

    let formattedContent = content;
    if (format) {
      try {
        formattedContent = await prettier.format(content, {
          parser: 'typescript',
          singleQuote: true,
          trailingComma: 'all',
          tabWidth: 2,
          semi: true,
        });
      } catch (error) {
        console.warn(`Prettier formatting failed for ${fullPath}:`, error);
      }
    }

    await fs.writeFile(fullPath, formattedContent, 'utf-8');
  }

  async writeController(content: string): Promise<void> {
    const moduleName = path.basename(this.modulePath);
    await this.writeFile(`${moduleName}.controller.ts`, content);
  }

  async writeService(content: string): Promise<void> {
    const moduleName = path.basename(this.modulePath);
    await this.writeFile(`${moduleName}.service.ts`, content);
  }

  async writeModule(content: string): Promise<void> {
    const moduleName = path.basename(this.modulePath);
    await this.writeFile(`${moduleName}.module.ts`, content);
  }

  async writeSchema(content: string): Promise<void> {
    const moduleName = path.basename(this.modulePath);
    await this.writeFile(`schema/${moduleName}.schema.ts`, content);
  }

  async writeCreateDto(content: string): Promise<void> {
    const moduleName = path.basename(this.modulePath);
    await this.writeFile(`dto/create-${moduleName}.dto.ts`, content);
  }

  async writeUpdateDto(content: string): Promise<void> {
    const moduleName = path.basename(this.modulePath);
    await this.writeFile(`dto/update-${moduleName}.dto.ts`, content);
  }

  getModulePath(): string {
    return this.modulePath;
  }
}

