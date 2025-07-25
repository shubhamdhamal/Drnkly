const express = require('express');
const router = express.Router();
const screenshotController = require('../controllers/screenshotController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// ✅ Define the upload directory
const uploadDir = '/var/www/Drnkly/images/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ uploads/ folder created');
}

// ✅ Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `payment_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// ✅ Screenshot Upload Route
router.post(
  '/upload-screenshot',
  upload.single('screenshot'),
  screenshotController.uploadScreenshot
);

module.exports = router;
