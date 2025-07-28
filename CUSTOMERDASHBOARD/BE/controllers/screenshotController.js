const path = require('path');

exports.uploadScreenshot = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Publicly accessible URL via image.peghouse.in domain
  const fileUrl = `https://image.peghouse.in/uploads/${req.file.filename}`;

  return res.status(200).json({
    message: 'Screenshot uploaded',
    imageUrl: fileUrl
  });
};
