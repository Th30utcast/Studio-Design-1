const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ========================= REGISTER =========================
router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    address,
    userType,
    membership,
    dataConsent
  } = req.body;

  try {
    if (!userType || !['buyer', 'seller'].includes(userType)) {
      return res.status(400).send("Invalid or missing user type.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      userType,
      membership: userType === 'seller' ? (membership || 'silver') : undefined,
      dataConsent: dataConsent === 'true' || dataConsent === true
    });

    await newUser.save();
    res.status(201).send("User registered successfully.");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Server error.");
  }
});

// ========================= LOGIN =========================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials.");
    }

    res.status(200).json({
      message: "Login successful.",
      userId: user._id,
      userType: user.userType,
      email: user.email,
      membership: user.membership || "silver",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || ""
    });    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error. Please try again later.");
  }
});

// ========================= GET ACCOUNT INFO =========================
router.get('/account', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).send("User not found.");

    res.status(200).json({
      membership: user.membership || "Standard",
      photo: user.photo || "",
      isVerified: user.isVerified || false,
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      dataConsent: user.dataConsent === true
    });
  } catch (err) {
    console.error("Account fetch error:", err);
    res.status(500).send("Server error.");
  }
});


// ========================= UPLOAD ID FOR VERIFICATION =========================
router.post('/upload-id', upload.single('idDocument'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).send("Missing email.");

    await User.updateOne({ email }, { isVerified: true });

    res.status(200).send("ID submitted and user marked as verified.");
  } catch (err) {
    console.error("ID upload error:", err);
    res.status(500).send("Server error.");
  }
});

// ========================= UPGRADE MEMBERSHIP =========================
router.post('/upgrade-membership', async (req, res) => {
  try {
    const { email } = req.body;

    await User.updateOne({ email }, { membership: "gold" });

    res.status(200).send("Membership upgraded to Gold.");
  } catch (err) {
    console.error("Membership upgrade error:", err);
    res.status(500).send("Server error.");
  }
});
// ========================= UPDATE USER INFO =========================
router.post('/update-info', upload.single('profilePicture'), async (req, res) => {
  try {
    const { email, phoneNumber, address, dataConsent } = req.body;

    if (!email) {
      return res.status(400).send("Missing email.");
    }

    const updateFields = {};

    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (address !== undefined) updateFields.address = address;
    if (dataConsent !== undefined) {
      updateFields.dataConsent = dataConsent === 'true' || dataConsent === true;
    }
    if (req.file) {
      updateFields.photo = `/uploads/${req.file.filename}`;
    }

    const result = await User.updateOne({ email }, { $set: updateFields });

    if (result.modifiedCount === 0) {
      return res.status(404).send("No user updated. Check email.");
    }

    res.status(200).send("Updated successfully.");
  } catch (err) {
    console.error("Update info error:", err);
    res.status(500).send("Server error while updating info.");
  }
});

module.exports = router;