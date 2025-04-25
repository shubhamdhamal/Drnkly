// models/Issue.js
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  category: {
    type: String,
    enum: [
      'Order Issues',
      'Payment Issues',
      'Delivery Issues',
      'Product Quality Issues',
      'Technical Issues',
      'Other'
    ],
    required: true
  },
  description: { type: String, required: true },
  file: { type: String },
  orderOrTransactionId: { type: String },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  contactEmail: { type: String },
  contactPhone: { type: String },
  receiveUpdates: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'escalated'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
