const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// === Multer Setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// === In-memory 2FA storage ===
const twoFATokens = new Map(); // { email -> { code, expiresAt } }

// ================== REGISTER ==================
router.post('/register', async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, phoneNumber,
      address, userType, membership, dataConsent
    } = req.body;

    if (!['buyer', 'seller'].includes(userType)) {
      return res.status(400).send("Invalid user type.");
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send("User already exists.");

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

// ================== LOGIN ==================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Incorrect password" });

    // If user has phone number → require 2FA
    if (user.phoneNumber) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      twoFATokens.set(email, { code, expiresAt });

      console.log(`📲 2FA code for ${email}: ${code}`);
      return res.json({ step: "2fa-required" });
    }

    return res.json({
      step: "success",
      user: {
        _id: user._id,
        email: user.email,
        userType: user.userType,
        membership: user.membership
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== VERIFY 2FA ==================
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;
    const entry = twoFATokens.get(email);

    if (!entry) return res.status(400).json({ error: "No 2FA in progress" });
    if (entry.code !== code) return res.status(401).json({ error: "Invalid code" });
    if (Date.now() > entry.expiresAt) {
      twoFATokens.delete(email);
      return res.status(401).json({ error: "Code expired" });
    }

    twoFATokens.delete(email);
    const user = await User.findOne({ email });

    return res.json({
      step: "success",
      user: {
        _id: user._id,
        email: user.email,
        userType: user.userType,
        membership: user.membership
      }
    });
  } catch (err) {
    console.error("2FA verify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== GET ACCOUNT INFO ==================
router.get('/account', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found.");

    res.status(200).json({
      membership: user.membership || "silver",
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

// ================== UPLOAD ID FOR VERIFICATION ==================
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

// ================== MEMBERSHIP CHANGE ==================
router.post('/upgrade-membership', async (req, res) => {
  try {
    const { email, newPlan } = req.body;
    if (!['silver', 'gold'].includes(newPlan)) {
      return res.status(400).send("Invalid plan.");
    }

    const result = await User.updateOne({ email }, { membership: newPlan });
    if (result.modifiedCount === 0) {
      return res.status(400).send("No changes were made. Check email.");
    }

    res.status(200).send("Membership updated.");
  } catch (err) {
    console.error("Membership error:", err);
    res.status(500).send("Server error.");
  }
});

// ================== UPDATE USER INFO ==================
router.post('/update-info', upload.single('profilePicture'), async (req, res) => {
  try {
    const { email, phoneNumber, address, dataConsent } = req.body;
    if (!email) return res.status(400).send("Missing email.");

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
      return res.status(404).send("No user updated.");
    }

    res.status(200).send("User updated.");
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).send("Server error.");
  }
});

// ================== REMOVE PROFILE PHOTO ==================
router.post('/remove-photo', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send("Missing email.");

    await User.updateOne({ email }, { photo: "/uploads/default-profile.png" });
    res.status(200).json({ message: "Photo reset." });
  } catch (err) {
    console.error("Remove photo error:", err);
    res.status(500).send("Server error.");
  }
});

module.exports = router;
