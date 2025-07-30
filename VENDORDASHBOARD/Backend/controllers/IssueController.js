const Issue = require('../models/issue');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/issues';

    // ✅ Ensure the directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // recursive for nested dirs
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

exports.uploadIssueFile = multer({ storage }).single('file');

// POST /api/issues/report
exports.reportIssue = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendorId = decoded.vendorId;

    if (!vendorId) return res.status(400).json({ error: "Vendor ID missing in token" });

    const {
      category,
      description,
      orderOrTransactionId,
      priority,
      contactEmail,
      contactPhone,
      receiveUpdates,
    } = req.body;

    const issue = new Issue({
      vendorId,
      category,
      description,
      file: req.file ? req.file.path : undefined,
      orderOrTransactionId,
      priority,
      contactEmail,
      contactPhone,
      receiveUpdates: receiveUpdates === 'true',
    });

    await issue.save();
    res.status(201).json({ message: "Issue reported successfully", issue });
  } catch (error) {
    console.error('Issue Report Error:', error);
    res.status(500).json({ error: 'Failed to report issue' });
  }
};


exports.getMyIssues = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendorId = decoded.vendorId;

    if (!vendorId) return res.status(400).json({ error: "Vendor ID missing in token" });

    const issues = await Issue.find({ vendorId }).sort({ createdAt: -1 }); // ✅ Mongoose

    res.status(200).json({ issues });
  } catch (error) {
    console.error("❌ Fetch Issues Error:", error.message);
    res.status(500).json({ error: "Failed to fetch issues", details: error.message });
  }
};

