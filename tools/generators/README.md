# NestJS Module Generator

Automated code generator for creating complete NestJS modules in the POS Backend monorepo.

## Features

- Generates complete CRUD modules with:
  - Controller (with full Swagger documentation)
  - Service (with Mongoose integration)
  - Module
  - Schema (Mongoose schema)
  - DTOs (Create & Update)
- Auto-registers modules in `app.module.ts`
- Follows project conventions and patterns
- Interactive CLI for field definitions
- Supports common fields (restaurantId, status, rank)

## Installation

Install dependencies in the generator tool:

```bash
cd tools/generators
pnpm install
```

Or from root:

```bash
pnpm install
```

## Usage

From the root of the monorepo:

```bash
# Interactive mode
pnpm generate

# With service and module name
pnpm generate:module menu-service promotions

# Alias
pnpm generate:feature order-service discounts
```

## Example

```bash
$ pnpm generate:module menu-service promotions

🚀 NestJS Module Generator

Select the service: menu-service
Enter module name: promotions

Field name: name
Field type: String
Is this field required? Yes

Field name: discount
Field type: Number
Is this field required? Yes
Minimum value: 0

Add another field? No

Include restaurantId field? Yes
Include status field (Active/Inactive)? Yes
Include rank field? No

📝 Generating files...

✓ Created promotions.controller.ts
✓ Created promotions.service.ts
✓ Created promotions.module.ts
✓ Created schema/index.ts
✓ Created dto/create-promotions.dto.ts
✓ Created dto/update-promotions.dto.ts
✓ Registered PromotionsModule in app.module.ts

✅ Module generation complete!
```

## Generated Structure

```
services/{service-name}/src/{module-name}/
├── {module-name}.controller.ts
├── {module-name}.service.ts
├── {module-name}.module.ts
├── schema/
│   └── index.ts
└── dto/
    ├── create-{module-name}.dto.ts
    └── update-{module-name}.dto.ts
```

## Field Types Supported

- `string` - Text fields
- `number` - Numeric fields (with min/max validation)
- `boolean` - Boolean fields
- `date` - Date fields
- `enum` - Enumeration fields
- `array` - Array fields
- `object` - Nested object fields

## Common Fields

The generator can automatically add:
- `restaurantId` - For restaurant-scoped resources
- `status` - Active/Inactive status
- `rank` - For ordering/sorting

## Notes

- All generated code follows the project's existing patterns
- Swagger documentation is automatically added to all endpoints
- Validation decorators are generated based on field types
- Code is automatically formatted with Prettier

