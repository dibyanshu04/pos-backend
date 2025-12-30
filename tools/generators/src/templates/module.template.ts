import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { {{EntityName}}, {{EntityName}}Schema } from './schema/{{moduleName}}.schema';
import { {{ControllerClassName}} } from './{{moduleName}}.controller';
import { {{ServiceClassName}} } from './{{moduleName}}.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: {{EntityName}}.name, schema: {{EntityName}}Schema }]),
  ],
  controllers: [{{ControllerClassName}}],
  providers: [{{ServiceClassName}}],
  exports: [{{ServiceClassName}}],
})
export class {{ModuleClassName}} {}

