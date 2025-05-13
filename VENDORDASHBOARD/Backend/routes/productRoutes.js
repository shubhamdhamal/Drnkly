const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateVendor } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/var/www/Drnkly/images/uploads';
    console.log("📁 Saving image to:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    console.log("📝 Generated filename:", filename);
    cb(null, filename);
  }
});

const upload = multer({ storage }).single('image');


// ✅ Route for adding product
router.post(
  '/add',
  authenticateVendor,
  upload.single('image'),
  (req, res, next) => {
    console.log("🔄 Multer processed file:", req.file);
    next();
  },
  productController.addProduct
);



// ✅ Update Product
router.put('/:id', authenticateVendor, productController.updateProduct);

// ✅ Delete Product
router.delete('/:id', authenticateVendor, productController.deleteProduct);

// ✅ Update Stock for Products
router.put('/update-stock', authenticateVendor, productController.updateStockForProducts);

// ✅ Get Vendor's Products
router.get('/vendor', authenticateVendor, productController.getProductsByVendor);

module.exports = router;