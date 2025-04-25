const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mobile: { type: String }, // optional field if using mobile login too
  password: { type: String, required: true },
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema, 'superadmins'); // 👈 specify collection name
