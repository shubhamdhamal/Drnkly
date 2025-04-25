const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  alcoholContent: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  volume: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },  // Make this field optional
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  inStock: { type: Boolean, default: true },  // This field tracks the product's stock status for the vendor
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);