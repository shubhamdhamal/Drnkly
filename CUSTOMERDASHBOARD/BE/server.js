const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

const cartRoutes = require('./routes/cartRoutes');
const issueRoutes = require('./routes/issueRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const passport = require('passport');
require('./config/passport'); 

dotenv.config();         // ✅ Load environment variables
connectDB();             // ✅ Connect to MongoDB

const app = express();
// adjust path

app.use(passport.initialize());

// ✅ Parse JSON and URL-encoded bodies BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Enable CORS before routes
app.use(cors({
  origin: ['http://localhost:5173', 'https://peghouse.in'],
  credentials: true
}));

// ✅ Static file handling
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/issues', express.static(path.join(__dirname, 'uploads/issues')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', orderRoutes);         // General route (like /api/orders)
app.use('/api/issues', issueRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ API is working on port 5000!');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
