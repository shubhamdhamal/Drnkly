// models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flatNo: { type: String },
  buildingNo: { type: String },
  fullAddress: { type: String },
  landmark: { type: String },
  additionalInfo: { type: String },
  address: { type: String, required: true }, // Combined address
city: { type: String, default: '' },
pincode: { type: String, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  type: { type: String, default: 'Manual' }, // e.g., Home, Work, Other
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Address', addressSchema);
