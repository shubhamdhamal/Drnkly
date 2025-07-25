const path = require('path');
const fs = require('fs');

exports.uploadScreenshot = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = `/uploads/${req.file.filename}`;
  return res.status(200).json({
    message: 'Screenshot uploaded',
    imageUrl: `https://peghouse.in${filePath}` // Public URL
  });
};
