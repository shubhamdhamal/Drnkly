const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  businessEmail: { type: String, required: true },
  businessPhone: { type: String, required: true },
  password: { type: String, required: true },
  license: { type: String },
  idProof: { type: String },
  location: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  productCategories: [{ type: String }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

// Hash the password before saving it
vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Only hash the password if it's new or modified

  const hashedPassword = await bcrypt.hash(this.password, 10); // Salt rounds = 10
  this.password = hashedPassword; // Update the password field with the hashed password
  next();
});

// Method to compare password during login
vendorSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Vendor', vendorSchema);