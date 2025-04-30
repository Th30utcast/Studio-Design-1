const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register Route
router.post('/register', async (req, res) => {
  const { fullname, username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
      loginAttempts: []
    });

    await newUser.save();
    res.status(201).send("User registered successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found.");
    }

    // Compare password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials.");
    }

    // Login successful, you can set session or generate a JWT token here if needed
    res.status(200).send("Login successful.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

module.exports = router;

// Get Account Info
router.get('/account', async (req, res) => {
  try {
      const { email } = req.query; // assuming you send email as query param
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).send("User not found.");
      }

      res.status(200).json({
          membership: user.membership || "Standard",
          photo: user.photo || "",
          isVerified: user.isVerified || false
      });
  } catch (err) {
      console.error(err);
      res.status(500).send("Server error.");
  }
});

// Upload ID for Verification
router.post('/upload-id', async (req, res) => {
  try {
      const { email } = req.body;
      // Here, assume ID was uploaded successfully (later you can add actual file upload)

      await User.updateOne({ email }, { isVerified: true });

      res.status(200).send("ID submitted and user marked as verified.");
  } catch (err) {
      console.error(err);
      res.status(500).send("Server error.");
  }
});

// Upgrade Membership
router.post('/upgrade-membership', async (req, res) => {
  try {
      const { email } = req.body;

      await User.updateOne({ email }, { membership: "Gold" });

      res.status(200).send("Membership upgraded to Gold.");
  } catch (err) {
      console.error(err);
      res.status(500).send("Server error.");
  }
});
