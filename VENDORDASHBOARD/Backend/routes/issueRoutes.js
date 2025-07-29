const express = require('express');
const router = express.Router();
const issueController = require('../controllers/IssueController');
const { authenticateVendor } = require('../middleware/auth');

// Vendor reporting an issue
router.post(
  '/report',
  authenticateVendor,
  issueController.uploadIssueFile,
  issueController.reportIssue
);

// Fetch vendor's own issues
router.get('/my', authenticateVendor, issueController.getMyIssues);

module.exports = router;
