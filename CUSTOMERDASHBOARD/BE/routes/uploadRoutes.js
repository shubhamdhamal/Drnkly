const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

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
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { orderId } = req.body; // 👈 Make sure frontend sends orderId
    const imageUrl = `https://peghouse.in/uploads/${req.file.filename}`;

    // ✅ Update the order document with paymentProof
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentProof: imageUrl },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Screenshot uploaded and order updated',
      imageUrl,
      updatedOrder,
    });
  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;
