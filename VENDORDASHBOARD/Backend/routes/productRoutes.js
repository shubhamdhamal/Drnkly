const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateVendor } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// ✅ Correct multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/var/www/Drnkly/images/uploads';
    console.log("📁 Saving image to:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    console.log("📸 File saved as:", uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('❌ Only image files are allowed!'), false);
    }
  }
});

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