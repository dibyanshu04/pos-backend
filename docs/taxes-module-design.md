# Taxes Module Design for Menu Service

## Overview

A comprehensive tax management system similar to Petpooja, supporting restaurant-level tax configuration with flexible application rules, priority-based calculation, and multiple scoping options.

---

## 1. Schema Fields

### Tax Schema (`tax.schema.ts`)

```typescript
@Schema({ timestamps: true })
export class Tax {
  // Basic Information
  @Prop({ required: true, trim: true })
  name: string; // e.g., "GST 18%", "Service Charge", "CGST 9%"

  @Prop({ trim: true })
  description?: string; // Optional description

  @Prop({ trim: true })
  taxCode?: string; // Tax identification code (e.g., "GST", "VAT", "SERVICE")

  // Restaurant Scope
  @Prop({ required: true, index: true })
  restaurantId: string; // Restaurant-level tax

  @Prop({ type: [String], default: [] })
  outletIds?: string[]; // Optional: specific outlets (empty = all outlets)

  // Tax Type & Calculation
  @Prop({
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    required: true,
    default: 'PERCENTAGE',
  })
  taxType: 'PERCENTAGE' | 'FIXED'; // Percentage or fixed amount

  @Prop({ required: true, min: 0 })
  value: number; // Percentage (0-100) or fixed amount (>= 0)

  // Tax Inclusion
  @Prop({
    type: String,
    enum: ['INCLUSIVE', 'EXCLUSIVE'],
    required: true,
    default: 'EXCLUSIVE',
  })
  inclusionType: 'INCLUSIVE' | 'EXCLUSIVE'; // Inclusive or Exclusive

  // Applicable Scope
  @Prop({
    type: String,
    enum: ['ITEM', 'CATEGORY', 'BILL'],
    required: true,
    default: 'ITEM',
  })
  scope: 'ITEM' | 'CATEGORY' | 'BILL'; // Where tax applies

  // Scope-specific References
  @Prop({ type: [String], default: [] })
  itemIds?: string[]; // For ITEM scope: specific items (empty = all items)

  @Prop({ type: [String], default: [] })
  categoryIds?: string[]; // For CATEGORY scope: specific categories (empty = all categories)

  @Prop({ type: [String], default: [] })
  excludedItemIds?: string[]; // Items to exclude from tax

  @Prop({ type: [String], default: [] })
  excludedCategoryIds?: string[]; // Categories to exclude from tax

  // Priority & Application
  @Prop({ required: true, default: 0, min: 0 })
  priority: number; // Lower number = higher priority (0 = highest)

  @Prop({ default: true })
  isActive: boolean; // Enable/disable tax

  // Additional Configuration
  @Prop({ default: false })
  isCompound: boolean; // If true, tax is calculated on base + previous taxes

  @Prop({ default: false })
  isRoundOff: boolean; // Round off tax amount

  @Prop({
    type: String,
    enum: ['ROUND_UP', 'ROUND_DOWN', 'ROUND_NEAREST'],
    default: 'ROUND_NEAREST',
  })
  roundOffMethod?: 'ROUND_UP' | 'ROUND_DOWN' | 'ROUND_NEAREST';

  // Display & Reporting
  @Prop({ default: true })
  showOnBill: boolean; // Display on bill/receipt

  @Prop({ default: true })
  showOnMenu: boolean; // Display on menu (for online)

  @Prop({ trim: true })
  displayName?: string; // Custom display name on bill

  // Status
  @Prop({
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  // Metadata
  @Prop({ default: 0, index: true })
  rank: number; // Display order
}
```

---

## 2. Enums Required

### Tax Type Enum
```typescript
export enum TaxType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}
```

### Inclusion Type Enum
```typescript
export enum InclusionType {
  INCLUSIVE = 'INCLUSIVE', // Tax included in price
  EXCLUSIVE = 'EXCLUSIVE', // Tax added to price
}
```

### Tax Scope Enum
```typescript
export enum TaxScope {
  ITEM = 'ITEM',      // Applied to individual items
  CATEGORY = 'CATEGORY', // Applied to entire category
  BILL = 'BILL',      // Applied to entire bill/order
}
```

### Round Off Method Enum
```typescript
export enum RoundOffMethod {
  ROUND_UP = 'ROUND_UP',
  ROUND_DOWN = 'ROUND_DOWN',
  ROUND_NEAREST = 'ROUND_NEAREST',
}
```

### Status Enum
```typescript
export enum TaxStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}
```

---

## 3. API Endpoints

### Base Path: `/taxes`

#### 1. Create Tax
```
POST /taxes
```
**Request Body:**
```json
{
  "name": "GST 18%",
  "description": "Goods and Services Tax",
  "taxCode": "GST",
  "restaurantId": "restaurant123",
  "outletIds": ["outlet1", "outlet2"], // Optional
  "taxType": "PERCENTAGE",
  "value": 18,
  "inclusionType": "EXCLUSIVE",
  "scope": "ITEM",
  "itemIds": ["item1", "item2"], // Optional for ITEM scope
  "categoryIds": ["cat1"], // Optional for CATEGORY scope
  "excludedItemIds": [], // Optional
  "excludedCategoryIds": [], // Optional
  "priority": 1,
  "isActive": true,
  "isCompound": false,
  "isRoundOff": true,
  "roundOffMethod": "ROUND_NEAREST",
  "showOnBill": true,
  "showOnMenu": true,
  "displayName": "GST",
  "rank": 0
}
```

#### 2. Get All Taxes
```
GET /taxes?restaurantId=restaurant123&scope=ITEM&isActive=true
```
**Query Parameters:**
- `restaurantId` (required)
- `scope` (optional): Filter by scope
- `isActive` (optional): Filter by active status
- `outletId` (optional): Filter by outlet

#### 3. Get Tax by ID
```
GET /taxes/:id
```

#### 4. Update Tax
```
PUT /taxes/:id
```

#### 5. Delete Tax
```
DELETE /taxes/:id
```

#### 6. Get Applicable Taxes for Item
```
GET /taxes/item/:itemId?restaurantId=restaurant123&outletId=outlet1
```
Returns all applicable taxes for a specific item, sorted by priority.

#### 7. Get Applicable Taxes for Category
```
GET /taxes/category/:categoryId?restaurantId=restaurant123&outletId=outlet1
```
Returns all applicable taxes for a category.

#### 8. Get Applicable Taxes for Bill
```
GET /taxes/bill?restaurantId=restaurant123&outletId=outlet1
```
Returns all bill-level taxes.

#### 9. Bulk Update Priority
```
PUT /taxes/priority/bulk
```
**Request Body:**
```json
{
  "updates": [
    { "id": "tax1", "priority": 0 },
    { "id": "tax2", "priority": 1 }
  ]
}
```

#### 10. Toggle Tax Status
```
PUT /taxes/:id/status
```
**Request Body:**
```json
{
  "isActive": false
}
```

#### 11. Get Tax Calculation Preview
```
POST /taxes/calculate
```
**Request Body:**
```json
{
  "restaurantId": "restaurant123",
  "outletId": "outlet1",
  "items": [
    {
      "itemId": "item1",
      "categoryId": "cat1",
      "basePrice": 100,
      "quantity": 2
    }
  ],
  "billSubtotal": 200
}
```
**Response:**
```json
{
  "itemTaxes": [
    {
      "itemId": "item1",
      "taxes": [
        {
          "taxId": "tax1",
          "taxName": "GST 18%",
          "amount": 36,
          "baseAmount": 200
        }
      ],
      "totalTax": 36
    }
  ],
  "billTaxes": [
    {
      "taxId": "tax2",
      "taxName": "Service Charge",
      "amount": 20,
      "baseAmount": 236
    }
  ],
  "totalTax": 56,
  "finalAmount": 256
}
```

---

## 4. Service Responsibilities

### Menu Service Responsibilities

**What Menu Service Handles:**

1. **Tax Definition & Configuration**
   - CRUD operations for tax definitions
   - Tax rule management (scope, priority, inclusion type)
   - Restaurant/outlet-level tax configuration
   - Tax enable/disable management

2. **Tax Rule Resolution**
   - Determine which taxes apply to items/categories/bills
   - Priority-based tax selection
   - Exclusion rule handling
   - Scope-based tax filtering

3. **Tax Metadata Management**
   - Tax display settings (show on bill, show on menu)
   - Tax codes and identification
   - Tax descriptions and display names

4. **Tax Query APIs**
   - Get applicable taxes for items
   - Get applicable taxes for categories
   - Get applicable taxes for bills
   - Tax calculation preview (for UI)

5. **Tax Validation**
   - Validate tax configuration
   - Check for conflicting tax rules
   - Validate tax values and ranges

### Order Service Responsibilities

**What Order Service Handles:**

1. **Tax Calculation**
   - Calculate tax amounts based on menu-service tax rules
   - Apply priority-based tax calculation
   - Handle inclusive vs exclusive taxes
   - Compound tax calculations
   - Round-off handling

2. **Tax Application**
   - Apply taxes to order items
   - Apply bill-level taxes
   - Calculate final order totals
   - Tax breakdown in order response

3. **Tax Storage in Orders**
   - Store tax details in order documents
   - Store tax amounts per item
   - Store total tax amount
   - Tax breakdown for reporting

4. **Tax Recalculation**
   - Recalculate taxes on order modifications
   - Handle tax changes during order lifecycle
   - Tax adjustments and refunds

### Integration Flow

```
┌─────────────────┐
│  Menu Service   │
│                 │
│ 1. Tax Config   │
│ 2. Tax Rules    │
│ 3. Tax Query    │
└────────┬────────┘
         │
         │ GET /taxes/item/:itemId
         │ GET /taxes/category/:categoryId
         │ GET /taxes/bill
         │
         ▼
┌─────────────────┐
│ Order Service   │
│                 │
│ 1. Fetch Rules  │
│ 2. Calculate   │
│ 3. Apply Taxes  │
│ 4. Store Taxes  │
└─────────────────┘
```

---

## 5. Tax Calculation Logic

### Priority-Based Application

1. **Sort taxes by priority** (ascending: 0 = highest priority)
2. **Apply taxes in order** based on scope:
   - ITEM scope: Applied to each item
   - CATEGORY scope: Applied to category subtotal
   - BILL scope: Applied to bill total

### Inclusive vs Exclusive

**Exclusive Tax:**
```
Base Price: ₹100
Tax (18%): ₹18
Final Price: ₹118
```

**Inclusive Tax:**
```
Display Price: ₹118 (includes tax)
Base Price: ₹100
Tax (18%): ₹18
```

### Compound Tax

If `isCompound = true`, tax is calculated on:
```
Base Amount + Previous Taxes
```

Example:
```
Base: ₹100
Tax 1 (10%): ₹10 (on ₹100)
Tax 2 (5%, compound): ₹5.50 (on ₹110)
Total: ₹115.50
```

### Round Off

- `ROUND_UP`: Always round up
- `ROUND_DOWN`: Always round down
- `ROUND_NEAREST`: Round to nearest

---

## 6. Example Scenarios

### Scenario 1: Item-Level GST
```json
{
  "name": "GST 18%",
  "taxType": "PERCENTAGE",
  "value": 18,
  "inclusionType": "EXCLUSIVE",
  "scope": "ITEM",
  "priority": 1,
  "isActive": true
}
```
Applies 18% GST to all items (or specific items if itemIds specified).

### Scenario 2: Category-Level Service Charge
```json
{
  "name": "Service Charge",
  "taxType": "PERCENTAGE",
  "value": 10,
  "inclusionType": "EXCLUSIVE",
  "scope": "CATEGORY",
  "categoryIds": ["beverages"],
  "priority": 2,
  "isActive": true
}
```
Applies 10% service charge to beverages category.

### Scenario 3: Bill-Level Service Tax
```json
{
  "name": "Service Tax",
  "taxType": "FIXED",
  "value": 50,
  "inclusionType": "EXCLUSIVE",
  "scope": "BILL",
  "priority": 0,
  "isActive": true
}
```
Adds ₹50 service tax to entire bill.

### Scenario 4: Inclusive Tax
```json
{
  "name": "VAT Inclusive",
  "taxType": "PERCENTAGE",
  "value": 12.5,
  "inclusionType": "INCLUSIVE",
  "scope": "ITEM",
  "priority": 1,
  "isActive": true
}
```
Price displayed includes 12.5% VAT.

---

## 7. Database Indexes

```typescript
TaxSchema.index({ restaurantId: 1, isActive: 1 });
TaxSchema.index({ restaurantId: 1, scope: 1, isActive: 1 });
TaxSchema.index({ restaurantId: 1, priority: 1 });
TaxSchema.index({ itemIds: 1 });
TaxSchema.index({ categoryIds: 1 });
TaxSchema.index({ outletIds: 1 });
```

---

## 8. DTOs Required

1. `CreateTaxDto` - For creating new tax
2. `UpdateTaxDto` - For updating tax
3. `TaxResponseDto` - For tax responses
4. `ApplicableTaxDto` - For applicable tax queries
5. `TaxCalculationRequestDto` - For calculation preview
6. `TaxCalculationResponseDto` - For calculation results
7. `BulkPriorityUpdateDto` - For bulk priority updates

---

## 9. Validation Rules

1. **Value Validation:**
   - Percentage: 0-100
   - Fixed: >= 0

2. **Scope Validation:**
   - ITEM scope: itemIds or excludedItemIds can be set
   - CATEGORY scope: categoryIds or excludedCategoryIds can be set
   - BILL scope: No item/category references

3. **Priority Validation:**
   - Must be >= 0
   - Lower = higher priority

4. **Restaurant Validation:**
   - restaurantId must exist
   - outletIds must exist if provided

---

## 10. Future Enhancements

1. **Time-based Tax Rules** - Taxes applicable during specific hours
2. **Date-based Tax Rules** - Taxes applicable on specific dates
3. **Customer Type Tax** - Different taxes for different customer types
4. **Tax Groups** - Group multiple taxes together
5. **Tax Exemptions** - Customer/item exemptions
6. **Tax Reporting** - Detailed tax reports and analytics

