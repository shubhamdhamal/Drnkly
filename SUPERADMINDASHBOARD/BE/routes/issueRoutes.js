const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const nodemailer = require('nodemailer');

// Configure nodemailer (use Gmail or SMTP provider)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vaishnavichandar2019@gmail.com',         // 🔁 your email
    pass: 'fwvf ykxo attv ppvg'             // 🔁 app password or SMTP pass
  }
});

// Function to send email
const sendStatusUpdateEmail = async (issue) => {
  const recipient = issue.contactEmail;
  if (!recipient) return;

  const mailOptions = {
    from: 'vaishnavichandar2019@gmail.com',
    to: recipient,
    subject: `Issue Status Updated: ${issue.category}`,
    html: `
      <h3>Your issue status has been updated</h3>
      <p><strong>Description:</strong> ${issue.description}</p>
      <p><strong>New Status:</strong> ${issue.status}</p>
      <p>Thank you for your patience!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${recipient}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};

// GET /api/issues
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

// PUT /api/issues/:id/status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Issue not found' });

    // ✅ Send email notification
    await sendStatusUpdateEmail(updated);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
