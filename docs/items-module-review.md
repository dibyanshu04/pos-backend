# Items Module Review & Missing Connections

## Current Issues

### 1. Items Schema
- ❌ Has inline `variations` array (should reference Variant module)
- ❌ Missing `variantIds` reference to Variant documents
- ❌ Missing `addonIds` reference to Addon documents
- ❌ Missing item-specific variant pricing overrides

### 2. Variants Schema
- ❌ Too basic - missing variant options/values
- ❌ Missing variant values with prices (e.g., Size: Small ₹100, Medium ₹150, Large ₹200)
- ❌ Missing connection to items

### 3. Addons Schema
- ❌ Missing support for variations on addons
- ❌ AddonItem doesn't support variants
- ❌ Missing connection to items

### 4. Missing Features
- ❌ Items can't reference Variant module
- ❌ Items can't reference Addon module
- ❌ Addons can't have variations (e.g., Size variations on addon items)

---

## Required Updates

### Priority 1: Update Variants Schema
- Add variant options/values with prices
- Support for variant groups (e.g., Size, Toppings)

### Priority 2: Update Items Schema
- Replace inline variations with `variantIds` reference
- Add `addonIds` reference
- Add item-specific variant pricing overrides

### Priority 3: Update Addons Schema
- Add variant support to AddonItem
- Support variations on addons

### Priority 4: Update DTOs
- Update CreateItemDto to use variantIds and addonIds
- Add variant pricing overrides

---

## Implementation Plan

1. Enhance Variant schema with options/values
2. Update Item schema with proper references
3. Update Addon schema with variant support
4. Update all DTOs
5. Update services to handle relationships

