// models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  city: { type: String },
  pincode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  type: { type: String, default: 'Manual' }, // e.g., 'Home', 'Work', 'Auto'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Address', addressSchema);
