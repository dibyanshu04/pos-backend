const mongoose = require('mongoose');

const RawMaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
    baseUnit: { type: String, required: true },
    averageCost: { type: Number, default: 0 }, // moving average cost snapshot
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('RawMaterial', RawMaterialSchema);

