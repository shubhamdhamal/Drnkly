const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const deliveryPartnerRoutes = require('./routes/deliveryPartnerRoutes');
const issueRoutes = require('./routes/issueRoutes');
const orderRoutes = require('./routes/orderRoutes'); // ✅ Correctly imported
const payouts = require('./routes/payoutRoutes');
const stats = require('./routes/vendorStatsRoutes');

const app = express();

// ✅ Ensure uploads folder exists
const uploadDir = '/var/www/Drnkly/images/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ uploads/ folder created');
}
app.use('/uploads', express.static(uploadDir));

// ✅ Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://vendor.drnkly.com', 'https://vendor.peghouse.in'],
  credentials: true
}));
app.use(bodyParser.json());

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.use('/api/vendor', vendorRoutes);              // login, register, profile
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/payouts', payouts);
app.use('/api/vendor-stats', stats);
app.use('/api/orders', orderRoutes);               // ✅ orders handled separately

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
