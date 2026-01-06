import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuServiceClient } from 'src/common/clients/menu-service.client';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { Recipe, RecipeSchema } from './recipe.schema';
import { RawMaterial, RawMaterialSchema } from 'src/raw-material/raw-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recipe.name, schema: RecipeSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
    ]),
  ],
  controllers: [RecipeController],
  providers: [RecipeService, MenuServiceClient],
  exports: [RecipeService],
})
export class RecipeModule {}

