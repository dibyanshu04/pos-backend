# Taxes Module - Quick Reference

## 1. Schema Fields

### Core Fields
- `name` (string, required) - Tax name
- `restaurantId` (string, required) - Restaurant scope
- `taxType` (enum: PERCENTAGE | FIXED) - Calculation type
- `value` (number, required) - Tax value (0-100 for %, >=0 for fixed)
- `inclusionType` (enum: INCLUSIVE | EXCLUSIVE) - Tax inclusion
- `scope` (enum: ITEM | CATEGORY | BILL) - Application scope
- `priority` (number, default: 0) - Application order (lower = higher priority)
- `isActive` (boolean, default: true) - Enable/disable

### Scope-Specific Fields
- `itemIds` (string[]) - For ITEM scope: specific items
- `categoryIds` (string[]) - For CATEGORY scope: specific categories
- `excludedItemIds` (string[]) - Items to exclude
- `excludedCategoryIds` (string[]) - Categories to exclude
- `outletIds` (string[]) - Specific outlets (empty = all)

### Additional Fields
- `isCompound` (boolean) - Calculate on base + previous taxes
- `isRoundOff` (boolean) - Round off tax amount
- `roundOffMethod` (enum) - Round up/down/nearest
- `showOnBill` (boolean) - Display on receipt
- `showOnMenu` (boolean) - Display on menu
- `taxCode` (string) - Tax identification code
- `description` (string) - Tax description
- `displayName` (string) - Custom display name
- `rank` (number) - Display order
- `status` (enum: Active | Inactive)

---

## 2. Enums Required

```typescript
// Tax Type
enum TaxType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

// Inclusion Type
enum InclusionType {
  INCLUSIVE = 'INCLUSIVE',  // Tax included in price
  EXCLUSIVE = 'EXCLUSIVE'   // Tax added to price
}

// Application Scope
enum TaxScope {
  ITEM = 'ITEM',        // Applied to items
  CATEGORY = 'CATEGORY', // Applied to categories
  BILL = 'BILL'         // Applied to entire bill
}

// Round Off Method
enum RoundOffMethod {
  ROUND_UP = 'ROUND_UP',
  ROUND_DOWN = 'ROUND_DOWN',
  ROUND_NEAREST = 'ROUND_NEAREST'
}

// Status
enum TaxStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}
```

---

## 3. API Endpoints

### CRUD Operations
- `POST /taxes` - Create tax
- `GET /taxes` - Get all taxes (with filters)
- `GET /taxes/:id` - Get tax by ID
- `PUT /taxes/:id` - Update tax
- `DELETE /taxes/:id` - Delete tax

### Query Operations
- `GET /taxes/item/:itemId` - Get applicable taxes for item
- `GET /taxes/category/:categoryId` - Get applicable taxes for category
- `GET /taxes/bill` - Get bill-level taxes

### Utility Operations
- `PUT /taxes/priority/bulk` - Bulk update priorities
- `PUT /taxes/:id/status` - Toggle tax status
- `POST /taxes/calculate` - Preview tax calculation

---

## 4. Service Responsibilities

### Menu Service Handles:
✅ **Tax Definition & Configuration**
- CRUD for tax definitions
- Tax rule management
- Restaurant/outlet-level configuration
- Enable/disable management

✅ **Tax Rule Resolution**
- Determine applicable taxes
- Priority-based selection
- Exclusion rule handling
- Scope-based filtering

✅ **Tax Query APIs**
- Get taxes for items/categories/bills
- Tax calculation preview

✅ **Tax Validation**
- Validate tax configuration
- Check for conflicts

### Order Service Handles:
✅ **Tax Calculation**
- Calculate tax amounts
- Apply priority-based calculation
- Handle inclusive/exclusive
- Compound tax calculations
- Round-off handling

✅ **Tax Application**
- Apply taxes to orders
- Calculate final totals
- Tax breakdown in responses

✅ **Tax Storage**
- Store tax details in orders
- Tax amounts per item
- Total tax for reporting

---

## 5. Key Calculation Rules

### Priority Application
1. Sort by priority (ascending: 0 = highest)
2. Apply ITEM scope taxes first
3. Then CATEGORY scope taxes
4. Finally BILL scope taxes

### Exclusive Tax Example
```
Base: ₹100
Tax (18%): ₹18
Final: ₹118
```

### Inclusive Tax Example
```
Display: ₹118 (includes tax)
Base: ₹100
Tax (18%): ₹18
```

### Compound Tax Example
```
Base: ₹100
Tax 1 (10%): ₹10
Tax 2 (5%, compound): ₹5.50 (on ₹110)
Total: ₹115.50
```

---

## 6. Example Tax Configurations

### Item-Level GST
```json
{
  "name": "GST 18%",
  "taxType": "PERCENTAGE",
  "value": 18,
  "inclusionType": "EXCLUSIVE",
  "scope": "ITEM",
  "priority": 1
}
```

### Category Service Charge
```json
{
  "name": "Service Charge",
  "taxType": "PERCENTAGE",
  "value": 10,
  "inclusionType": "EXCLUSIVE",
  "scope": "CATEGORY",
  "categoryIds": ["beverages"],
  "priority": 2
}
```

### Bill-Level Fixed Tax
```json
{
  "name": "Service Tax",
  "taxType": "FIXED",
  "value": 50,
  "inclusionType": "EXCLUSIVE",
  "scope": "BILL",
  "priority": 0
}
```

---

## 7. Integration Flow

```
Menu Service                    Order Service
─────────────────              ─────────────────
Tax Config                      Fetch Tax Rules
Tax Rules          ──────────>  Calculate Taxes
Tax Query                       Apply to Order
                                 Store in Order
```

**Order Service calls Menu Service:**
- `GET /taxes/item/:itemId` - When adding items
- `GET /taxes/category/:categoryId` - For category taxes
- `GET /taxes/bill` - For bill-level taxes

---

## 8. Database Indexes

```typescript
TaxSchema.index({ restaurantId: 1, isActive: 1 });
TaxSchema.index({ restaurantId: 1, scope: 1, isActive: 1 });
TaxSchema.index({ restaurantId: 1, priority: 1 });
TaxSchema.index({ itemIds: 1 });
TaxSchema.index({ categoryIds: 1 });
```

---

## Summary

**Menu Service = Tax Configuration & Rules**
- Define taxes
- Set rules and priorities
- Query applicable taxes
- Provide tax calculation preview

**Order Service = Tax Calculation & Application**
- Fetch tax rules from menu-service
- Calculate tax amounts
- Apply to orders
- Store tax details

This separation ensures menu-service manages tax definitions while order-service handles dynamic calculations during order processing.

