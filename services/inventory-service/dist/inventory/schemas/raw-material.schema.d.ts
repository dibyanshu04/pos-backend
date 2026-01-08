import { HydratedDocument } from 'mongoose';
export type RawMaterialDocument = HydratedDocument<RawMaterial>;
export declare class RawMaterial {
    name: string;
    unit: string;
    baseUnit: string;
    averageCost: number;
    isActive: boolean;
}
export declare const RawMaterialSchema: import("mongoose").Schema<RawMaterial, import("mongoose").Model<RawMaterial, any, any, any, (import("mongoose").Document<unknown, any, RawMaterial, any, import("mongoose").DefaultSchemaOptions> & RawMaterial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, RawMaterial, any, import("mongoose").DefaultSchemaOptions> & RawMaterial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, RawMaterial>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RawMaterial, import("mongoose").Document<unknown, {}, RawMaterial, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, import("mongoose").Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    unit?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, import("mongoose").Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    baseUnit?: import("mongoose").SchemaDefinitionProperty<string, RawMaterial, import("mongoose").Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    averageCost?: import("mongoose").SchemaDefinitionProperty<number, RawMaterial, import("mongoose").Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, RawMaterial, import("mongoose").Document<unknown, {}, RawMaterial, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<RawMaterial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, RawMaterial>;
