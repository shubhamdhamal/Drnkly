const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Order = require('../models/Order'); // make sure this path is correct

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


router.post('/upload-screenshot', upload.single('screenshot'), async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!orderId) {
      return res.status(400).json({ message: 'Missing orderId' });
    }

    const imageUrl = `https://peghouse.in/uploads/${req.file.filename}`;

    // 🧪 Debug log
    console.log("📤 Uploading screenshot for order:", orderId);
    console.log("📷 File:", req.file.filename);
    console.log("🌐 Image URL:", imageUrl);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentProof: imageUrl },
      { new: true }
    );

    if (!updatedOrder) {
      console.error('❌ Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Screenshot uploaded and order updated',
      imageUrl,
      updatedOrder,
    });
  } catch (err) {
    console.error("❌ Server error during screenshot upload:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});


module.exports = router;
