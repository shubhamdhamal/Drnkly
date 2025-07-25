const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST /api/uploads/upload-screenshot
router.post('/upload-screenshot', upload.single('screenshot'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `https://peghouse.in/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'Screenshot uploaded', imageUrl });
});

module.exports = router;
