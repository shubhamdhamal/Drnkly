const Vendor = require('../models/Vendor');
const nodemailer = require('nodemailer');

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json({ vendors });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).lean();
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json({ vendor });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor details', error: error.message });
  }
};

exports.updateVendorStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    console.log('UPDATE REQUEST:', { id, status }); // ✅ log for debugging
  
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
  
    try {
      const vendor = await Vendor.findByIdAndUpdate(
        id,
        { verificationStatus: status },
        { new: true }
      );
  
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
  
      console.log('Vendor updated:', vendor); // ✅ confirm update
  
      // Optional: Only send mail if email exists
      if (vendor.businessEmail) {
        await sendStatusEmail(vendor.businessEmail, vendor.businessName, status);
      }
  
      res.status(200).json({ message: `Vendor ${status}`, vendor });
    } catch (err) {
      console.error('ERROR IN UPDATE:', err); // ✅ log backend error
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  };
  

const sendStatusEmail = async (email, name, status) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ssamale3010@gmail.com',
      pass: 'naxinpyeatvgnngf', // Use Gmail App Password
    },
  });

  const subject = status === 'verified' ? 'Shop Approved 🎉' : 'Shop Rejected ❌';
  const text = status === 'verified'
    ? `Hi ${name}, your liquor shop has been approved and is now live on the platform.`
    : `Hi ${name}, your shop application was rejected. Please contact support.`;

  await transporter.sendMail({
    from: '"LiqKart Admin" <your-email@gmail.com>',
    to: email,
    subject,
    text,
  });
};
