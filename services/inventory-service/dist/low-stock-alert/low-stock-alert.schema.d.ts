import { Document, Types } from 'mongoose';
export type LowStockAlertDocument = LowStockAlert & Document;
export declare class LowStockAlert {
    restaurantId: string;
    outletId: string;
    rawMaterialId: Types.ObjectId;
    rawMaterialName: string;
    threshold: number;
    stockAtTrigger: number;
    isResolved: boolean;
    resolvedAt?: Date;
}
export declare const LowStockAlertSchema: import("mongoose").Schema<LowStockAlert, import("mongoose").Model<LowStockAlert, any, any, any, (Document<unknown, any, LowStockAlert, any, import("mongoose").DefaultSchemaOptions> & LowStockAlert & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, LowStockAlert, any, import("mongoose").DefaultSchemaOptions> & LowStockAlert & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, LowStockAlert>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LowStockAlert, Document<unknown, {}, LowStockAlert, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    outletId?: import("mongoose").SchemaDefinitionProperty<string, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    rawMaterialId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    rawMaterialName?: import("mongoose").SchemaDefinitionProperty<string, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    threshold?: import("mongoose").SchemaDefinitionProperty<number, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    stockAtTrigger?: import("mongoose").SchemaDefinitionProperty<number, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isResolved?: import("mongoose").SchemaDefinitionProperty<boolean, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    resolvedAt?: import("mongoose").SchemaDefinitionProperty<Date, LowStockAlert, Document<unknown, {}, LowStockAlert, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<LowStockAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, LowStockAlert>;
