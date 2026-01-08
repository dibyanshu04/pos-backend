declare class RecipeComponentDto {
    rawMaterialId: string;
    quantityPerUnit: number;
}
export declare class CreateRecipeDto {
    restaurantId: string;
    outletId: string;
    menuItemId: string;
    createdByUserId?: string;
    components: RecipeComponentDto[];
}
export {};
