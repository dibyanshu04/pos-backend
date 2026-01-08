import { Document } from 'mongoose';
import { RawMaterialCategory } from './enums/raw-material-category.enum';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
import { PurchaseUnitEnum } from 'src/common/units/purchase-unit.enum';
export type RawMaterialDocument = RawMaterial & Document;
export interface CostingSnapshot {
    averageCost: number;
    lastPurchaseCost: number;
}
export declare class RawMaterial {
    restaurantId: string;
    outletId: string;
    name: string;
    code: string;
    category: RawMaterialCategory;
    baseUnit: BaseUnitEnum;
    purchaseUnit: PurchaseUnitEnum;
    conversionFactor: number;
    isPerishable: boolean;
    shelfLifeInDays?: number;
    costing: CostingSnapshot;
    isActive: boolean;
    createdByUserId?: string;
    updatedByUserId?: string;
    lowStockThreshold?: number;
}
export declare const RawMaterialSchema: import("mongoose").Schema<RawMaterial, import("mongoose").Model<RawMaterial, any, any, any, (Document<unknown, any, RawMaterial, any, import("mongoose").DefaultSchemaOptions> & RawMaterial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, RawMaterial, any, import("mongoose").DefaultSchemaOptions> & RawMaterial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, RawMaterial>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RawMaterial, Document<unknown, {}, RawMaterial, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    outletId?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    name?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    code?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    category?: import("mongoose").SchemaDefinitionProperty<RawMaterialCategory, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    baseUnit?: import("mongoose").SchemaDefinitionProperty<BaseUnitEnum, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    purchaseUnit?: import("mongoose").SchemaDefinitionProperty<PurchaseUnitEnum, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    conversionFactor?: import("mongoose").SchemaDefinitionProperty<number, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isPerishable?: import("mongoose").SchemaDefinitionProperty<boolean, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    shelfLifeInDays?: import("mongoose").SchemaDefinitionProperty<number, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    costing?: import("mongoose").SchemaDefinitionProperty<CostingSnapshot, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdByUserId?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedByUserId?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    lowStockThreshold?: import("mongoose").SchemaDefinitionProperty<number, RawMaterial, Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, RawMaterial>;
