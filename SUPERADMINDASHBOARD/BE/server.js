const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const issueRoutes = require('./routes/issueRoutes');
const path = require('path');  // Add this line at the top of your file



const app = express();
const PORT = 5003;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files (uploaded files like ID proof) from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
const vendorRoutes = require('./routes/vendorRoutes');
app.use('/api', vendorRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes); // Add this if not already
const orderRoutes = require('./routes/orderRoutes');
app.use('/api', orderRoutes);
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api', dashboardRoutes);
app.use('/api/issues', issueRoutes);


// MongoDB Connection
mongoose.connect('mongodb+srv://ssamale3010:7IfmAhPMU81gZv8f@cluster0.fcfwmlh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error(err));
