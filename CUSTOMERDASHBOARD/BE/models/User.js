const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  mobile: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  dob: { type: Date, required: true },
  aadhaar: { type: String, required: true },
  idProof: { type: String }, // Path to the ID proof file
  selfDeclaration: { type: Boolean, required: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }, // New field for verification status
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
