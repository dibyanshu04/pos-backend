import { Document, Types } from 'mongoose';
import { BaseUnitEnum } from 'src/common/units/base-unit.enum';
export type RecipeDocument = Recipe & Document;
export declare class RecipeComponent {
    rawMaterialId: Types.ObjectId;
    rawMaterialName: string;
    quantityPerUnit: number;
    unit: BaseUnitEnum;
}
export declare class Recipe {
    restaurantId: string;
    outletId: string;
    menuItemId: string;
    menuItemName: string;
    components: RecipeComponent[];
    isActive: boolean;
    createdByUserId?: string;
    updatedByUserId?: string;
}
export declare const RecipeSchema: import("mongoose").Schema<Recipe, import("mongoose").Model<Recipe, any, any, any, (Document<unknown, any, Recipe, any, import("mongoose").DefaultSchemaOptions> & Recipe & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Recipe, any, import("mongoose").DefaultSchemaOptions> & Recipe & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Recipe>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Recipe, Document<unknown, {}, Recipe, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    outletId?: import("mongoose").SchemaDefinitionProperty<string, Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    menuItemId?: import("mongoose").SchemaDefinitionProperty<string, Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    menuItemName?: import("mongoose").SchemaDefinitionProperty<string, Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    components?: import("mongoose").SchemaDefinitionProperty<RecipeComponent[], Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdByUserId?: import("mongoose").SchemaDefinitionProperty<string, Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedByUserId?: import("mongoose").SchemaDefinitionProperty<string, Recipe, Document<unknown, {}, Recipe, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Recipe & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Recipe>;
