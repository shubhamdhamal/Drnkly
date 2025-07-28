const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const screenshotController = require('../controllers/screenshotController');

// ✅ Absolute path where files should be saved
const uploadDir = '/var/www/Drnkly/images/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ uploads folder created at:', uploadDir);
}

// ✅ Configure Multer to store in the correct public folder
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
