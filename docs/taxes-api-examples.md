# Taxes Module - API Examples & cURL Commands

## Base URL
```
http://localhost:3004
```
(Adjust port based on your menu-service configuration)

---

## 1. Create GST Slab (Auto-creates CGST & SGST)

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
    "taxTitle": "CGST",
    "showOnBill": true,
    "showOnMenu": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "GST Slab created successfully (CGST and SGST)",
  "data": [
    {
      "_id": "cgst_id_123",
      "name": "CGST 2.5%",
      "value": 2.5,
      "taxType": "PERCENTAGE",
      "gstComponent": "CGST",
      "taxTitle": "CGST",
      "calculationType": "FORWARD",
      ...
    },
    {
      "_id": "sgst_id_456",
      "name": "SGST 2.5%",
      "value": 2.5,
      "taxType": "PERCENTAGE",
      "gstComponent": "SGST",
      "taxTitle": "SGST",
      "calculationType": "FORWARD",
      ...
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 2. Create Regular Tax (VAT/Other)

```bash
curl -X POST http://localhost:3004/taxes \
  -H "Content-Type: application/json" \
  -d '{
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
    "isMandatory": false,
    "description": "Service charge applied to items"
  }'
```

---

## 3. Get Taxes for Item Selection Dropdown

```bash
curl -X GET "http://localhost:3004/taxes/selection/list?restaurantId=restaurant123&outletId=outlet1"
```

**Response:**
```json
{
  "success": true,
  "message": "Taxes for selection retrieved successfully",
  "data": [
    {
      "_id": "cgst_id_123",
      "name": "CGST 2.5%",
      "value": 2.5,
      "taxType": "PERCENTAGE",
      "calculationType": "FORWARD",
      "taxTitle": "CGST",
      "gstComponent": "CGST"
    },
    {
      "_id": "sgst_id_456",
      "name": "SGST 2.5%",
      "value": 2.5,
      "taxType": "PERCENTAGE",
      "calculationType": "FORWARD",
      "taxTitle": "SGST",
      "gstComponent": "SGST"
    },
    {
      "_id": "service_charge_id",
      "name": "Service Charge",
      "value": 10,
      "taxType": "PERCENTAGE",
      "calculationType": "FORWARD",
      "taxTitle": "Service Charge"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 4. Get All Taxes (with filters)

```bash
curl -X GET "http://localhost:3004/taxes?restaurantId=restaurant123&scope=ITEM&isActive=true&outletId=outlet1"
```

---

## 5. Create Item with Selected Taxes

```bash
curl -X POST http://localhost:3004/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hara Bhara Kabab",
    "shortCode": "hara bhara kabab",
    "onlineDisplayName": "hara bhara kabab",
    "categoryId": "category123",
    "basePrice": 100,
    "outletId": "outlet1",
    "gstType": "Service",
    "taxIds": ["cgst_id_123", "sgst_id_456"],
    "orderType": ["Delivery", "Pick Up", "Dine In", "Expose-Online"],
    "dietaryType": "Veg",
    "isAvailable": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "_id": "item_id_789",
    "name": "Hara Bhara Kabab",
    "basePrice": 100,
    "taxIds": ["cgst_id_123", "sgst_id_456"],
    ...
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 6. Get Item with Taxes (for Ordering App)

```bash
curl -X GET "http://localhost:3004/items/item_id_789?includeTaxes=true"
```

**Response:**
```json
{
  "success": true,
  "message": "Item retrieved successfully",
  "data": {
    "_id": "item_id_789",
    "name": "Hara Bhara Kabab",
    "basePrice": 100,
    "taxIds": ["cgst_id_123", "sgst_id_456"],
    "taxes": [
      {
        "id": "cgst_id_123",
        "name": "CGST 2.5%",
        "value": 2.5,
        "taxType": "PERCENTAGE",
        "calculationType": "FORWARD",
        "displayName": "CGST",
        "gstComponent": "CGST"
      },
      {
        "id": "sgst_id_456",
        "name": "SGST 2.5%",
        "value": 2.5,
        "taxType": "PERCENTAGE",
        "calculationType": "FORWARD",
        "displayName": "SGST",
        "gstComponent": "SGST"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**For Ordering App Display:**
Format taxes as: `"Taxes: CGST (2.5%), SGST (2.5%)"` (as shown in screenshot 3)

---

## 7. Get All Items with Taxes

```bash
curl -X GET "http://localhost:3004/items?outletId=outlet1&includeTaxes=true"
```

---

## 8. Update Item Taxes

```bash
curl -X PUT http://localhost:3004/items/item_id_789 \
  -H "Content-Type: application/json" \
  -d '{
    "taxIds": ["cgst_id_123", "sgst_id_456", "service_charge_id"]
  }'
```

---

## 9. Get Applicable Taxes for Item

```bash
curl -X GET "http://localhost:3004/taxes/item/item_id_789?restaurantId=restaurant123&outletId=outlet1"
```

---

## 10. Toggle Tax Status

```bash
curl -X PUT http://localhost:3004/taxes/tax_id/status \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

---

## 11. Bulk Update Tax Priorities

```bash
curl -X PUT http://localhost:3004/taxes/priority/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      { "id": "tax1", "priority": 0 },
      { "id": "tax2", "priority": 1 },
      { "id": "tax3", "priority": 2 }
    ]
  }'
```

---

## Complete Workflow Example

### Step 1: Create GST 5% Slab
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
    "isActive": true
  }'
```

**Save the returned CGST and SGST IDs**

### Step 2: Get Taxes for Selection (in UI)
```bash
curl -X GET "http://localhost:3004/taxes/selection/list?restaurantId=restaurant123"
```

### Step 3: Create Item with Taxes
```bash
curl -X POST http://localhost:3004/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cheese Garlic Bread",
    "categoryId": "category123",
    "basePrice": 120,
    "outletId": "outlet1",
    "taxIds": ["cgst_id_from_step1", "sgst_id_from_step1"]
  }'
```

### Step 4: Display in Ordering App
```bash
curl -X GET "http://localhost:3004/items/item_id?includeTaxes=true"
```

**Display format:** "Taxes: CGST (2.5%), SGST (2.5%)"

---

## Notes

1. **GST Slab Creation**: When you create a GST Slab, it automatically creates CGST and SGST. You'll get both tax IDs in the response.

2. **Tax Selection**: Use `/taxes/selection/list` to populate the tax dropdown in item creation form (like Petpooja screenshot 2).

3. **Tax Display**: Use `includeTaxes=true` when fetching items for the ordering app to display taxes (like Petpooja screenshot 3).

4. **Forward vs Backward**:
   - **Forward**: Tax added to price (e.g., ₹100 + 18% = ₹118)
   - **Backward**: Tax included in price (e.g., ₹118 includes 18% tax)

5. **Order Types**: Taxes can be filtered by order type (Delivery, Pick Up, Dine In).

