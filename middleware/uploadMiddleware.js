const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = '/var/www/Drnkly/images/uploads'; // ✅ Final upload folder for nginx

// Create directory if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
module.exports = upload;
