const Issue = require('../models/Issue');
const mongoose = require('mongoose');

exports.reportIssue = async (req, res) => {
  try {
    const {
      userId,
      vendorId,
      category,
      description,
      orderOrTransactionId,
      priority,
      contactEmail,
      contactPhone,
      receiveUpdates
    } = req.body;

    const file = req.file ? req.file.filename : null;

    const issueData = {
      category,
      description,
      file,
      orderOrTransactionId,
      priority,
      contactEmail,
      contactPhone,
      receiveUpdates
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      issueData.userId = userId;
    }

    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      issueData.vendorId = vendorId;
    }

    const newIssue = new Issue(issueData);
    await newIssue.save();

    res.status(201).json({ message: 'Issue reported successfully', issue: newIssue });

  } catch (error) {
    console.error('Error in reportIssue:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getUserIssues = async (req, res) => {
  try {
    const userId = req.params.userId;
    const issues = await Issue.find({ userId }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};
