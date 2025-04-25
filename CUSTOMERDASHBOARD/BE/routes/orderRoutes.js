const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const {
  placeOrder,
  updatePaymentStatus,
  getOrdersByUser,
  getOrderDetails
} = require('../controllers/orderController');

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ Use same field name here as frontend (screenshot)
router.put('/orders/:orderId/pay', upload.single('screenshot'), updatePaymentStatus);

router.post('/orders', placeOrder);
router.get('/orders/user/:userId', getOrdersByUser);
router.get('/orders/:orderNumber', getOrderDetails);

module.exports = router;
