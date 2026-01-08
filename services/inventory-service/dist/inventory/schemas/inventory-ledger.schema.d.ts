import { HydratedDocument } from 'mongoose';
export type InventoryLedgerDocument = HydratedDocument<InventoryLedger>;
export declare class InventoryLedger {
    rawMaterialId: string;
    rawMaterialName: string;
    restaurantId: string;
    outletId: string;
    transactionType: 'SALE_CONSUMPTION';
    quantityChange: number;
    unit: string;
    referenceType: 'ORDER';
    referenceId: string;
    remarks?: string;
}
export declare const InventoryLedgerSchema: import("mongoose").Schema<InventoryLedger, import("mongoose").Model<InventoryLedger, any, any, any, (import("mongoose").Document<unknown, any, InventoryLedger, any, import("mongoose").DefaultSchemaOptions> & InventoryLedger & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, InventoryLedger, any, import("mongoose").DefaultSchemaOptions> & InventoryLedger & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, InventoryLedger>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    rawMaterialId?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    rawMaterialName?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    outletId?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    transactionType?: import("mongoose").SchemaDefinitionProperty<"SALE_CONSUMPTION", InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    quantityChange?: import("mongoose").SchemaDefinitionProperty<number, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    unit?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    referenceType?: import("mongoose").SchemaDefinitionProperty<"ORDER", InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    referenceId?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    remarks?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, import("mongoose").Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, InventoryLedger>;
