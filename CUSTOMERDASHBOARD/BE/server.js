const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cartRoutes');
const issueRoutes = require('./routes/issueRoutes');
dotenv.config(); // Load environment variables from .env file
connectDB(); // Call the DB connection

const app = express();

app.use(cors({
  origin: 'https://peghouse.in', // Replace with your frontend URL
  credentials: true
}));

//app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes')); // ✅ Use router, not direct function
// Mount the products routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', cartRoutes);
const orderRoutes = require('./routes/orderRoutes');
app.use('/api', orderRoutes);
app.use('/uploads/issues', express.static('uploads/issues'));
// Routes
app.use('/api/issues', issueRoutes);

app.get('/', (req, res) => {
  res.send('API is working on port 5000!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});







