import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeStatusDto } from './dto/update-recipe-status.dto';
import { RecipeService } from './recipe.service';
export declare class RecipeController {
    private readonly recipeService;
    constructor(recipeService: RecipeService);
    create(dto: CreateRecipeDto, req: any): Promise<SuccessResponseDto<any>>;
    findByMenuItem(menuItemId: string, outletId: string): Promise<SuccessResponseDto<any>>;
    findAll(outletId: string): Promise<SuccessResponseDto<any[]>>;
    updateStatus(id: string, dto: UpdateRecipeStatusDto, req: any): Promise<SuccessResponseDto<any>>;
}
