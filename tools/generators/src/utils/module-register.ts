import * as fs from 'fs-extra';
import * as path from 'path';
import * as prettier from 'prettier';

export class ModuleRegister {
  private appModulePath: string;

  constructor(servicePath: string) {
    this.appModulePath = path.join(servicePath, 'src', 'app.module.ts');
  }

  async registerModule(
    moduleClassName: string,
    moduleImportPath: string,
  ): Promise<void> {
    if (!(await fs.pathExists(this.appModulePath))) {
      throw new Error(`app.module.ts not found at ${this.appModulePath}`);
    }

    let content = await fs.readFile(this.appModulePath, 'utf-8');

    // Check if module is already registered
    if (content.includes(moduleClassName)) {
      console.log(`Module ${moduleClassName} is already registered`);
      return;
    }

    // Add import statement - find the last module import
    const importStatement = `import { ${moduleClassName} } from '${moduleImportPath}';`;
    const moduleImportRegex = /^import \{ .*Module \} from .*;$/gm;
    const moduleImports = content.match(moduleImportRegex) || [];
    
    if (moduleImports.length > 0) {
      const lastModuleImport = moduleImports[moduleImports.length - 1];
      const lastIndex = content.lastIndexOf(lastModuleImport);
      const insertIndex = lastIndex + lastModuleImport.length;
      content = 
        content.slice(0, insertIndex) + 
        '\n' + importStatement + 
        content.slice(insertIndex);
    } else {
      // Fallback: add after first import
      const firstImportMatch = content.match(/^import .* from .*;$/m);
      if (firstImportMatch) {
        const insertIndex = firstImportMatch.index! + firstImportMatch[0].length;
        content = 
          content.slice(0, insertIndex) + 
          '\n' + importStatement + 
          content.slice(insertIndex);
      }
    }

    // Add to imports array in @Module decorator
    // Find the imports array
    const importsArrayRegex = /imports:\s*\[([\s\S]*?)\]/;
    const importsMatch = content.match(importsArrayRegex);
    
    if (importsMatch) {
      const importsArrayContent = importsMatch[1];
      
      // Check if already in imports
      if (!importsArrayContent.includes(moduleClassName)) {
        // Find the last module in the array
        const lastModuleMatch = importsArrayContent.match(/(\w+Module),?\s*$/m);
        const newImport = `    ${moduleClassName},`;
        
        if (lastModuleMatch) {
          // Insert after the last module
          const lastModuleIndex = importsMatch.index! + importsMatch[0].indexOf(lastModuleMatch[0]) + lastModuleMatch[0].length;
          content = 
            content.slice(0, lastModuleIndex) + 
            '\n' + newImport + 
            content.slice(lastModuleIndex);
        } else {
          // Insert at the beginning of the array
          const arrayStart = importsMatch.index! + importsMatch[0].indexOf('[') + 1;
          content = 
            content.slice(0, arrayStart) + 
            '\n' + newImport + 
            content.slice(arrayStart);
        }
      }
    }

    // Format with prettier
    try {
      content = await prettier.format(content, {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        semi: true,
      });
    } catch (error) {
      console.warn('Prettier formatting failed:', error);
    }

    await fs.writeFile(this.appModulePath, content, 'utf-8');
    console.log(`✓ Registered ${moduleClassName} in app.module.ts`);
  }
}

