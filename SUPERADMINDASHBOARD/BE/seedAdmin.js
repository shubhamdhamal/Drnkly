const mongoose = require("mongoose");
require("dotenv").config();
const SuperAdmin = require("./models/SuperAdmin");

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await SuperAdmin.findOne({ email: "admin@example.com" });
  if (exists) {
    console.log("SuperAdmin already exists");
    process.exit();
  }

  const newAdmin = new SuperAdmin({
    email: "admin@example.com",
    password: "secure123", // will be hashed automatically
  });

  await newAdmin.save();
  console.log("✅ SuperAdmin created successfully!");
  process.exit();
};

createAdmin();
