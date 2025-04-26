const User = require('../models/User');
const nodemailer = require('nodemailer'); // Import nodemailer

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find();
    res.status(200).json({ customers });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
};
// Create a transport using your email service (e.g., Gmail, SendGrid)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vaishnavichandar2019@gmail.com',  // Replace with your Gmail
    pass: 'teau dzdh wyvx azue'      // Replace with your App Password
  }
});

// Send email function
const sendEmail = (email, status) => {
  const subject = `Your Verification Status: ${status === 'Verified' ? 'Accepted' : 'Rejected'}`;
  const text = `Dear User,\n\nYour account verification has been ${status === 'Verified' ? 'accepted' : 'rejected'}.\n\nThank you for your patience.`;

  const mailOptions = {
    from: 'vaishnavichandar2019@gmail.com',
    to: email,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Accept verification (set status to 'Verified')
exports.acceptVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'Verified' }, // Update status to 'Verified'
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send email notification
    sendEmail(updatedUser.email, 'Verified');  // Send email after updating status

    res.status(200).json({ message: 'User verification accepted', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting verification', error: err.message });
  }
};

// Reject verification (set status to 'Rejected')
exports.rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'Rejected' }, // Update status to 'Rejected'
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send email notification
    sendEmail(updatedUser.email, 'Rejected');  // Send email after updating status

    res.status(200).json({ message: 'User verification rejected', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting verification', error: err.message });
  }
};