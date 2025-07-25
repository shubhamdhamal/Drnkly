const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false
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
      },
      handoverStatus: {
        type: String,
        enum: ['pending', 'handedOver'],
        default: 'pending'
      },
      deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered'],
        default: 'pending'
      }
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
  paymentProof: {
  type: String,
  default: null
},
  transactionId: {
    type: String, // Store the transaction ID here
    default: null,
  },
  couponCode: {
    type: String, // Store the applied coupon code
    default: null,
  },
  discountAmount: {
    type: Number, // Store the discount amount
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tracking: [
    {
      status: String,
      color: String, // You can use colors for each status
      description: String,
    },
  ], 
});

// Pre-save middleware to generate sequential order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Get and increment the counter
      const counter = await Counter.findOneAndUpdate(
        { name: 'orderNumber' },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      );
      
      // Generate the order number with the new count
      this.orderNumber = `ORD${counter.count}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Order', orderSchema);
