export declare class RecipeComponentDto {
    rawMaterialId: string;
    rawMaterialName: string;
    quantityPerUnit: number;
    unit: string;
}
export declare class ConsumeItemDto {
    menuItemId: string;
    menuItemName: string;
    quantityOrdered: number;
    recipeSnapshot: RecipeComponentDto[];
}
export declare class ConsumeInventoryDto {
    orderId: string;
    restaurantId: string;
    outletId: string;
    items: ConsumeItemDto[];
}
