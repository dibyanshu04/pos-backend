import { Document, Types } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { PurchaseUnitEnum } from 'src/common/units/purchase-unit.enum';
export type GrnDocument = Grn & Document;
export declare class GrnItem {
    rawMaterialId: Types.ObjectId;
    rawMaterialName: string;
    purchaseQuantity: number;
    purchaseUnit: PurchaseUnitEnum;
    baseQuantity: number;
    baseUnit: BaseUnitEnum;
    unitCost: number;
    totalCost: number;
}
export declare class Grn {
    restaurantId: string;
    outletId: string;
    vendorId: Types.ObjectId;
    vendorName: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    items: GrnItem[];
    totalPurchaseCost: number;
    createdByUserId?: string;
    createdAt: Date;
}
export declare const GrnSchema: import("mongoose").Schema<Grn, import("mongoose").Model<Grn, any, any, any, (Document<unknown, any, Grn, any, import("mongoose").DefaultSchemaOptions> & Grn & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Grn, any, import("mongoose").DefaultSchemaOptions> & Grn & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Grn>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Grn, Document<unknown, {}, Grn, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    outletId?: import("mongoose").SchemaDefinitionProperty<string, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    vendorId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    vendorName?: import("mongoose").SchemaDefinitionProperty<string, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    invoiceNumber?: import("mongoose").SchemaDefinitionProperty<string, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    invoiceDate?: import("mongoose").SchemaDefinitionProperty<Date, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    items?: import("mongoose").SchemaDefinitionProperty<GrnItem[], Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    totalPurchaseCost?: import("mongoose").SchemaDefinitionProperty<number, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdByUserId?: import("mongoose").SchemaDefinitionProperty<string, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Grn, Document<unknown, {}, Grn, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Grn & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Grn>;
