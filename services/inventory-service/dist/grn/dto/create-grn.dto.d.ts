declare class GrnItemDto {
    rawMaterialId: string;
    purchaseQuantity: number;
    unitCost: number;
}
export declare class CreateGrnDto {
    restaurantId: string;
    outletId: string;
    vendorId: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    items: GrnItemDto[];
    createdByUserId?: string;
}
export {};
