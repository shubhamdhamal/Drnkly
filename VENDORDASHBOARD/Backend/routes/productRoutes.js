const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateVendor } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// ✅ Correct multer storage config to save images with correct names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/var/www/Drnkly/images/uploads');  // ✅ Matches Nginx path
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); 
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept image files only
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  },
});


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