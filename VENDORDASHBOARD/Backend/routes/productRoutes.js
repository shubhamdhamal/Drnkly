const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateVendor } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// ✅ Correct multer storage config to save images with correct names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // 1713123456789.jpg
  }
});

const upload = multer({ storage });

// ✅ Add Product (with image)
router.post('/add', authenticateVendor, upload.single('image'), productController.addProduct);

// ✅ Update Product
router.put('/:id', authenticateVendor, productController.updateProduct);

// ✅ Delete Product
router.delete('/:id', authenticateVendor, productController.deleteProduct);

// ✅ Update Stock for Products
router.put('/update-stock', authenticateVendor, productController.updateStockForProducts);

// ✅ Get Vendor's Products
router.get('/vendor', authenticateVendor, productController.getProductsByVendor);

module.exports = router;