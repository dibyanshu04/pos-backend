import { Model } from 'mongoose';
import { MenuServiceClient } from 'src/common/clients/menu-service.client';
import { RawMaterialDocument } from 'src/raw-material/raw-material.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeStatusDto } from './dto/update-recipe-status.dto';
import { Recipe, RecipeDocument } from './recipe.schema';
export declare class RecipeService {
    private readonly recipeModel;
    private readonly rawMaterialModel;
    private readonly menuServiceClient;
    constructor(recipeModel: Model<RecipeDocument>, rawMaterialModel: Model<RawMaterialDocument>, menuServiceClient: MenuServiceClient);
    create(dto: CreateRecipeDto): Promise<Recipe>;
    findByMenuItem(menuItemId: string, outletId: string): Promise<Recipe>;
    findAll(outletId: string): Promise<Recipe[]>;
    updateStatus(id: string, dto: UpdateRecipeStatusDto): Promise<Recipe>;
    private validateAndBuildComponents;
}
