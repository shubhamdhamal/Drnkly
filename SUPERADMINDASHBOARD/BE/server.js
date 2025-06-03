require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const issueRoutes = require('./routes/issueRoutes');
const path = require('path');

const app = express();
const PORT = 5003;

app.use(cors({
  origin: ['http://localhost:5173', 'https://admin.peghouse.in'], // make sure frontend URL matches
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mounted under /api
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api', require('./routes/vendorRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api', require('./routes/dashboardRoutes')); // ✅ so /api/dashboard-stats works
app.use('/api/issues', issueRoutes);
app.use('/api/admin', require('./routes/sidebarRoutes'));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {  // better to use env variable here
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
