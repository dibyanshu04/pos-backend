/**
 * Test Script for Menu Service
 * Tests Variants, Addons, Items, and Taxes modules
 */

const axios = require('axios');

const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://localhost:3004';
const RESTAURANT_ID = 'test-restaurant-123';
const OUTLET_ID = 'test-outlet-123';
const CATEGORY_ID = 'test-category-123';

const testResults = {
  passed: [],
  failed: [],
  total: 0,
};

function logTest(name, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed.push({ name, message });
    console.log(`✅ PASS: ${name}${message ? ' - ' + message : ''}`);
  } else {
    testResults.failed.push({ name, message });
    console.log(`❌ FAIL: ${name}${message ? ' - ' + message : ''}`);
  }
}

async function testVariants() {
  console.log('\n📦 Testing Variants Module...\n');
  
  try {
    // Create Variant
    const variantData = {
      name: 'Size',
      department: 'Size Variants',
      restaurantId: RESTAURANT_ID,
      values: [
        { name: 'Small', price: 0, isDefault: true, status: 'Active', rank: 1 },
        { name: 'Medium', price: 20, status: 'Active', rank: 2 },
        { name: 'Large', price: 40, status: 'Active', rank: 3 },
      ],
      isRequired: true,
      minSelection: 1,
      maxSelection: 1,
      status: 'Active',
    };

    const variantResponse = await axios.post(`${MENU_SERVICE_URL}/variants`, variantData);
    const variantId = variantResponse.data.data._id;
    logTest('Create Variant', variantId !== undefined, `Variant ID: ${variantId}`);

    // Get Variant
    const getVariant = await axios.get(`${MENU_SERVICE_URL}/variants/${variantId}`);
    logTest('Get Variant', getVariant.data.data.name === 'Size');

    // List Variants
    const listVariants = await axios.get(`${MENU_SERVICE_URL}/variants?restaurantId=${RESTAURANT_ID}`);
    logTest('List Variants', listVariants.data.data.length > 0);

    return variantId;
  } catch (error) {
    logTest('Variants Module', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testAddons() {
  console.log('\n🍕 Testing Addons Module...\n');
  
  try {
    // Create Addon
    const addonData = {
      departmentName: 'Toppings',
      restaurantId: RESTAURANT_ID,
      items: [
        {
          name: 'Extra Cheese',
          price: 30,
          attribute: 'Veg',
          available: 'Active',
          rank: 1,
        },
        {
          name: 'Mushrooms',
          price: 25,
          attribute: 'Veg',
          available: 'Active',
          rank: 2,
        },
      ],
      addonMin: 0,
      addonMax: 3,
      addonItemSelection: 'Allow Multiple Selection',
      status: 'Active',
    };

    const addonResponse = await axios.post(`${MENU_SERVICE_URL}/addons`, addonData);
    const addonId = addonResponse.data.data._id;
    logTest('Create Addon', addonId !== undefined, `Addon ID: ${addonId}`);

    // Get Addon
    const getAddon = await axios.get(`${MENU_SERVICE_URL}/addons/${addonId}`);
    logTest('Get Addon', getAddon.data.data.departmentName === 'Toppings');

    // List Addons
    const listAddons = await axios.get(`${MENU_SERVICE_URL}/addons?restaurantId=${RESTAURANT_ID}`);
    logTest('List Addons', listAddons.data.data.length > 0);

    return addonId;
  } catch (error) {
    logTest('Addons Module', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testTaxes() {
  console.log('\n💰 Testing Taxes Module...\n');
  
  try {
    // Create Tax
    const taxData = {
      name: 'GST',
      description: 'Goods and Services Tax',
      taxCode: 'GST',
      restaurantId: RESTAURANT_ID,
      outletIds: [OUTLET_ID],
      taxType: 'PERCENTAGE',
      value: 18,
      inclusionType: 'EXCLUSIVE',
      scope: 'BILL',
      priority: 1,
      isActive: true,
      status: 'ACTIVE',
    };

    const taxResponse = await axios.post(`${MENU_SERVICE_URL}/taxes`, taxData);
    const taxId = taxResponse.data.data._id;
    logTest('Create Tax', taxId !== undefined, `Tax ID: ${taxId}`);

    // Get Tax
    const getTax = await axios.get(`${MENU_SERVICE_URL}/taxes/${taxId}`);
    logTest('Get Tax', getTax.data.data.name === 'GST');

    // List Taxes
    const listTaxes = await axios.get(`${MENU_SERVICE_URL}/taxes?restaurantId=${RESTAURANT_ID}`);
    logTest('List Taxes', listTaxes.data.data.length > 0);

    return taxId;
  } catch (error) {
    logTest('Taxes Module', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testItems(variantId, addonId, taxId) {
  console.log('\n🍔 Testing Items Module...\n');
  
  try {
    // Create Item with Variants, Addons, and Taxes
    const itemData = {
      name: 'Test Pizza',
      basePrice: 200,
      categoryId: CATEGORY_ID,
      outletId: OUTLET_ID,
      variantIds: variantId ? [variantId] : [],
      addonIds: addonId ? [addonId] : [],
      taxIds: taxId ? [taxId] : [],
      dietaryType: 'Veg',
      isAvailable: true,
    };

    const itemResponse = await axios.post(`${MENU_SERVICE_URL}/items`, itemData);
    const itemId = itemResponse.data.data._id;
    logTest('Create Item', itemId !== undefined, `Item ID: ${itemId}`);

    // Get Item
    const getItem = await axios.get(`${MENU_SERVICE_URL}/items/${itemId}`);
    logTest('Get Item', getItem.data.data.name === 'Test Pizza');

    // Get Item with Taxes
    const getItemWithTaxes = await axios.get(`${MENU_SERVICE_URL}/items/${itemId}/with-taxes`);
    logTest('Get Item with Taxes', getItemWithTaxes.data.data.taxes !== undefined);

    // List Items
    const listItems = await axios.get(`${MENU_SERVICE_URL}/items?outletId=${OUTLET_ID}`);
    logTest('List Items', listItems.data.data.length > 0);

    return itemId;
  } catch (error) {
    logTest('Items Module', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting Menu Service Tests...\n');
  console.log(`📍 Testing against: ${MENU_SERVICE_URL}\n`);

  try {
    // Test Variants
    const variantId = await testVariants();

    // Test Addons
    const addonId = await testAddons();

    // Test Taxes
    const taxId = await testTaxes();

    // Test Items (with connections)
    const itemId = await testItems(variantId, addonId, taxId);

    // Print Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`Success Rate: ${((testResults.passed.length / testResults.total) * 100).toFixed(2)}%`);

    if (testResults.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.failed.forEach((test) => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
    }

    return {
      total: testResults.total,
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      successRate: ((testResults.passed.length / testResults.total) * 100).toFixed(2),
      results: testResults,
    };
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    return {
      total: testResults.total,
      passed: testResults.passed.length,
      failed: testResults.failed.length + 1,
      successRate: '0.00',
      error: error.message,
    };
  }
}

if (require.main === module) {
  runTests().then((summary) => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}

module.exports = { runTests };

