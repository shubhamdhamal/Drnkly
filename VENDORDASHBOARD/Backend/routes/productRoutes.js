const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateVendor } = require('../middleware/auth');
const upload = require('../utils/multerConfig'); // ✅ Use central multer config

// ✅ Add Product
router.post(
  '/add',
  authenticateVendor,
  upload.single('image'),
  (req, res, next) => {
    console.log("📸 Multer processed file:", req.file);
    next();
  },
  productController.addProduct
);

// ✅ Other routes (no multer needed)
router.put('/:id', authenticateVendor, productController.updateProduct);
router.delete('/:id', authenticateVendor, productController.deleteProduct);
router.put('/update-stock', authenticateVendor, productController.updateStockForProducts);
router.get('/vendor', authenticateVendor, productController.getProductsByVendor);

module.exports = router;
