# Taxes Module Implementation Summary

## Changes Made

### 1. Tax Schema Updates (`taxes.schema.ts`)

**Added Petpooja-style fields:**
- `taxCategory`: 'GST_SLAB' | 'VAT' | 'OTHER' - Tax category type
- `calculationType`: 'FORWARD' | 'BACKWARD' - Forward/Backward calculation
- `applicableOrderTypes`: string[] - Order types where tax applies (Delivery, Pick Up, Dine In)
- `isMandatory`: boolean - Mandatory tax flag
- `cgstSapCode`: string - CGST SAP Code
- `sgstSapCode`: string - SGST SAP Code
- `taxTitle`: string - Custom tax title for display
- `excludeFromEcommerce`: boolean - E-commerce operator exclusion
- `parentGstSlabId`: string - Links CGST/SGST pairs
- `gstComponent`: 'CGST' | 'SGST' - Component type for GST Slab

### 2. Item Schema Updates (`item.schema.ts`)

**Changed:**
- Removed: `taxRate: number` (old single tax rate)
- Added: `taxIds: string[]` - Array of Tax IDs (Petpooja style - items select taxes)

### 3. Item DTO Updates (`create-item.dto.ts`)

**Changed:**
- Removed: `taxRate` field
- Added: `taxIds?: string[]` - Array of tax IDs for item

### 4. Tax Service Updates (`taxes.service.ts`)

**Added:**
- **GST Slab Auto-Creation**: When `taxCategory: 'GST_SLAB'` is selected, automatically creates CGST and SGST pair
  - Example: GST 5% → CGST 2.5% + SGST 2.5%
- **`getTaxesForSelection()`**: Returns taxes formatted for item selection dropdown

### 5. Tax Controller Updates (`taxes.controller.ts`)

**Added:**
- `GET /taxes/selection/list` - Get taxes for item selection dropdown (Petpooja style)
- Updated `POST /taxes` to handle GST Slab creation (returns array of CGST/SGST)

### 6. Items Service Updates (`items.service.ts`)

**Added:**
- `findOneWithTaxes()` - Get item with populated tax details
- `findAllWithTaxes()` - Get all items with populated tax details
- Tax model injection for tax population

### 7. Items Controller Updates (`items.controller.ts`)

**Added:**
- `includeTaxes` query parameter to `GET /items` and `GET /items/:id`
- When `includeTaxes=true`, returns items with tax details (for ordering app display)

### 8. Items Module Updates (`items.module.ts`)

**Added:**
- Tax schema import for tax population in items service

---

## API Endpoints

### Tax Management

#### 1. Create Tax (with GST Slab support)
```bash
POST /taxes
Content-Type: application/json

{
  "name": "GST 5%",
  "restaurantId": "restaurant123",
  "taxCategory": "GST_SLAB",
  "value": 5,
  "taxType": "PERCENTAGE",
  "inclusionType": "EXCLUSIVE",
  "scope": "ITEM",
  "calculationType": "FORWARD",
  "applicableOrderTypes": ["Delivery", "Pick Up", "Dine In"],
  "priority": 1,
  "isActive": true,
  "taxTitle": "CGST"
}
```

**Response (GST Slab):**
```json
{
  "success": true,
  "message": "GST Slab created successfully (CGST and SGST)",
  "data": [
    {
      "_id": "cgst_id",
      "name": "CGST 2.5%",
      "value": 2.5,
      "gstComponent": "CGST",
      ...
    },
    {
      "_id": "sgst_id",
      "name": "SGST 2.5%",
      "value": 2.5,
      "gstComponent": "SGST",
      ...
    }
  ]
}
```

#### 2. Get Taxes for Item Selection
```bash
GET /taxes/selection/list?restaurantId=restaurant123&outletId=outlet1
```

**Response:**
```json
{
  "success": true,
  "message": "Taxes for selection retrieved successfully",
  "data": [
    {
      "_id": "tax1",
      "name": "CGST (2.5%)",
      "value": 2.5,
      "taxType": "PERCENTAGE",
      "calculationType": "FORWARD",
      "taxTitle": "CGST",
      "gstComponent": "CGST"
    },
    {
      "_id": "tax2",
      "name": "SGST (2.5%)",
      "value": 2.5,
      "taxType": "PERCENTAGE",
      "calculationType": "FORWARD",
      "taxTitle": "SGST",
      "gstComponent": "SGST"
    }
  ]
}
```

#### 3. Create Regular Tax
```bash
POST /taxes
Content-Type: application/json

{
  "name": "Service Charge",
  "restaurantId": "restaurant123",
  "taxCategory": "OTHER",
  "value": 10,
  "taxType": "PERCENTAGE",
  "inclusionType": "EXCLUSIVE",
  "scope": "ITEM",
  "calculationType": "FORWARD",
  "applicableOrderTypes": ["Delivery", "Dine In"],
  "priority": 2,
  "isActive": true,
  "isMandatory": false
}
```

### Item Management

#### 4. Create Item with Taxes
```bash
POST /items
Content-Type: application/json

{
  "name": "Hara Bhara Kabab",
  "shortCode": "hara bhara kabab",
  "categoryId": "category123",
  "basePrice": 100,
  "outletId": "outlet1",
  "gstType": "Service",
  "taxIds": ["cgst_tax_id", "sgst_tax_id"],
  "orderType": ["Delivery", "Pick Up", "Dine In", "Expose-Online"],
  "dietaryType": "Veg"
}
```

#### 5. Get Item with Taxes (for Ordering App)
```bash
GET /items/item_id?includeTaxes=true
```

**Response:**
```json
{
  "success": true,
  "message": "Item retrieved successfully",
  "data": {
    "_id": "item_id",
    "name": "Hara Bhara Kabab",
    "basePrice": 100,
    "taxIds": ["cgst_tax_id", "sgst_tax_id"],
    "taxes": [
      {
        "id": "cgst_tax_id",
        "name": "CGST 2.5%",
        "value": 2.5,
        "taxType": "PERCENTAGE",
        "calculationType": "FORWARD",
        "displayName": "CGST",
        "gstComponent": "CGST"
      },
      {
        "id": "sgst_tax_id",
        "name": "SGST 2.5%",
        "value": 2.5,
        "taxType": "PERCENTAGE",
        "calculationType": "FORWARD",
        "displayName": "SGST",
        "gstComponent": "SGST"
      }
    ]
  }
}
```

#### 6. Get All Items with Taxes
```bash
GET /items?outletId=outlet1&includeTaxes=true
```

---

## Complete Example Flow

### Step 1: Create GST Slab Tax
```bash
curl -X POST http://localhost:3004/taxes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GST 5%",
    "restaurantId": "restaurant123",
    "taxCategory": "GST_SLAB",
    "value": 5,
    "taxType": "PERCENTAGE",
    "inclusionType": "EXCLUSIVE",
    "scope": "ITEM",
    "calculationType": "FORWARD",
    "applicableOrderTypes": ["Delivery", "Pick Up", "Dine In"],
    "priority": 1,
    "isActive": true,
    "taxTitle": "CGST"
  }'
```

**Response:** Returns CGST 2.5% and SGST 2.5% tax IDs

### Step 2: Get Taxes for Selection (in Item Creation Form)
```bash
curl -X GET "http://localhost:3004/taxes/selection/list?restaurantId=restaurant123&outletId=outlet1"
```

### Step 3: Create Item with Selected Taxes
```bash
curl -X POST http://localhost:3004/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hara Bhara Kabab",
    "shortCode": "hara bhara kabab",
    "categoryId": "category123",
    "basePrice": 100,
    "outletId": "outlet1",
    "gstType": "Service",
    "taxIds": ["cgst_tax_id", "sgst_tax_id"],
    "orderType": ["Delivery", "Pick Up", "Dine In"],
    "dietaryType": "Veg"
  }'
```

### Step 4: Get Item with Taxes (for Ordering App Display)
```bash
curl -X GET "http://localhost:3004/items/item_id?includeTaxes=true"
```

**Response includes:**
```json
{
  "taxes": [
    {
      "displayName": "CGST",
      "value": 2.5,
      "gstComponent": "CGST"
    },
    {
      "displayName": "SGST",
      "value": 2.5,
      "gstComponent": "SGST"
    }
  ]
}
```

---

## Key Features Implemented

✅ **GST Slab Auto-Creation**: Creating GST 5% automatically creates CGST 2.5% + SGST 2.5%
✅ **Item Tax Selection**: Items can select multiple taxes (like Petpooja dropdown)
✅ **Tax Display in Ordering App**: Items include tax details when `includeTaxes=true`
✅ **Forward/Backward Calculation**: Support for both calculation types
✅ **Order Type Filtering**: Taxes can be applied to specific order types
✅ **Mandatory Taxes**: Support for taxes that cannot be removed
✅ **SAP Code Support**: CGST and SGST SAP codes
✅ **Tax Title Customization**: Custom display names for bills

---

## Migration Notes

**Breaking Change:**
- Items schema changed from `taxRate: number` to `taxIds: string[]`
- Existing items with `taxRate` will need migration
- Update item creation/update forms to use tax selection instead of tax rate input

---

## Next Steps

1. **Order Service Integration**: Order service should fetch taxes from menu-service and calculate tax amounts
2. **Tax Calculation Logic**: Implement Forward/Backward calculation in order-service
3. **Migration Script**: Create script to migrate existing items from `taxRate` to `taxIds`
4. **UI Updates**: Update item creation form to show tax selection dropdown
5. **Ordering App**: Display taxes like "Taxes: CGST (2.5%), SGST (2.5%)" on items

