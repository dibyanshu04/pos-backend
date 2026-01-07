const mongoose = require('mongoose');

const InventoryLedgerSchema = new mongoose.Schema(
  {
    rawMaterialId: { type: String, required: true, index: true },
    rawMaterialName: { type: String, required: true },
    restaurantId: { type: String, required: true, index: true },
    outletId: { type: String, required: true, index: true },
    transactionType: {
      type: String,
      enum: ['SALE_CONSUMPTION'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    unit: { type: String, required: true },
    referenceType: { type: String, enum: ['ORDER'], required: true },
    referenceId: { type: String, required: true, index: true },
    remarks: { type: String },
  },
  { timestamps: true },
);

InventoryLedgerSchema.index({
  referenceType: 1,
  referenceId: 1,
  transactionType: 1,
});

module.exports = mongoose.model('InventoryLedger', InventoryLedgerSchema);

