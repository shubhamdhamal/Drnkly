const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
   
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      image: String,
      price: Number,
      quantity: Number,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      }, // ✅ Status per product
      handoverStatus: {
        type: String,
        enum: ['pending', 'handedOver'],
        default: 'pending'
      },
      deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered'],
        default: 'pending'
      },
      deliveryBoyStatus: { // Add this field
        type: String,
        enum: ['pending', 'accepted', 'rejected'], // The status of the delivery boy for each item
        default: 'pending'
      },
    }
  ],
  deliveryAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  totalAmount: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);