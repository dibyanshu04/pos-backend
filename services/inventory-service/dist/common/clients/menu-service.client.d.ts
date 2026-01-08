export declare class MenuServiceClient {
    validateMenuItem(menuItemId: string, outletId: string): Promise<{
        _id: string;
        name: string;
        outletId: string;
    }>;
}
