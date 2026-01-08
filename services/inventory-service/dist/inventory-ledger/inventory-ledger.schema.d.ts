import { Document, Types } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
export type InventoryLedgerDocument = InventoryLedger & Document;
export declare enum InventoryTransactionType {
    PURCHASE = "PURCHASE",
    SALE_CONSUMPTION = "SALE_CONSUMPTION",
    WASTAGE = "WASTAGE",
    ADJUSTMENT = "ADJUSTMENT",
    OPENING_BALANCE = "OPENING_BALANCE"
}
export declare enum InventoryReferenceType {
    ORDER = "ORDER",
    GRN = "GRN",
    WASTAGE = "WASTAGE",
    ADJUSTMENT = "ADJUSTMENT"
}
export declare class InventoryLedger {
    restaurantId: string;
    outletId: string;
    rawMaterialId: Types.ObjectId;
    transactionType: InventoryTransactionType;
    quantityChange: number;
    unit: BaseUnitEnum;
    referenceType?: InventoryReferenceType;
    referenceId?: Types.ObjectId;
    remarks?: string;
    createdByUserId: string;
    createdAt: Date;
}
export declare const InventoryLedgerSchema: import("mongoose").Schema<InventoryLedger, import("mongoose").Model<InventoryLedger, any, any, any, (Document<unknown, any, InventoryLedger, any, import("mongoose").DefaultSchemaOptions> & InventoryLedger & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, InventoryLedger, any, import("mongoose").DefaultSchemaOptions> & InventoryLedger & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, InventoryLedger>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InventoryLedger, Document<unknown, {}, InventoryLedger, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    outletId?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    rawMaterialId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    transactionType?: import("mongoose").SchemaDefinitionProperty<InventoryTransactionType, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    quantityChange?: import("mongoose").SchemaDefinitionProperty<number, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    unit?: import("mongoose").SchemaDefinitionProperty<BaseUnitEnum, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    referenceType?: import("mongoose").SchemaDefinitionProperty<InventoryReferenceType, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    referenceId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    remarks?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdByUserId?: import("mongoose").SchemaDefinitionProperty<string, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, InventoryLedger, Document<unknown, {}, InventoryLedger, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<InventoryLedger & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, InventoryLedger>;
