const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const deliveryPartnerRoutes = require('./routes/deliveryPartnerRoutes');
const issueRoutes = require('./routes/issueRoutes');
const orderRoutes = require('./controllers/orderController');


const app = express();

// ✅ 1. Ensure 'uploads' folder exists for storing product images
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('✅ uploads/ folder created');
}

// ✅ 2. Serve uploaded images statically
app.use('/uploads', express.static(uploadDir));

// ✅ 3. Apply middlewares
app.use(cors());
app.use(bodyParser.json());

// ✅ 4. MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ 5. Register API routes
app.use('/api/vendor', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);
app.use(orderRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/qr', require('./routes/qrRoutes'));

// ✅ 6. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});