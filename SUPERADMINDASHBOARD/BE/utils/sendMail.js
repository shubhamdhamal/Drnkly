const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Optional: Log connection verification
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Ready to send emails");
  }
});

const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: `"LiqKart Admin" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: ", info.response);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw err;
  }
};

module.exports = sendMail;
