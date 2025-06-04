const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cartRoutes');
const issueRoutes = require('./routes/issueRoutes');

dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS before routes
app.use(cors({
  origin: ['http://localhost:5173', 'https://peghouse.in'], // whitelist frontend origins
  credentials: true
}));

app.use(express.json()); // ✅ Add this if missing, needed to parse JSON

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/issues', express.static('uploads/issues'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', cartRoutes);
app.use('/api', require('./routes/orderRoutes'));
app.use('/api/issues', issueRoutes);

app.get('/', (req, res) => {
  res.send('API is working on port 5000!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
