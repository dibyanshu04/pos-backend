const mongoose = require('mongoose');

const RawMaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
    baseUnit: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('RawMaterial', RawMaterialSchema);

