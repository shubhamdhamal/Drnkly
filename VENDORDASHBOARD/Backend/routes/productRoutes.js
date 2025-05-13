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

    if (!req.file) {
      console.error("❌ Multer failed to save the image.");
    } else {
      console.log("📁 File Path:", req.file.path);
      console.log("📁 Destination:", req.file.destination);
      console.log("📁 Filename:", req.file.filename);
    }

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
