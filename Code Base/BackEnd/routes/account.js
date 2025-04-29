const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

// Set up Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile_photos/");
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Example Authentication Middleware (replace with real one)
function fakeAuthMiddleware(req, res, next) {
  req.user = { id: "YOUR_USER_ID_HERE" }; // TEMPORARY user id for testing
  next();
}

router.use(fakeAuthMiddleware);

// Route to update user profile
router.post("/update", upload.single("photo"), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {
      firstName: req.body.name?.split(" ")[0],
      lastName: req.body.name?.split(" ")[1] || "",
      phoneNumber: req.body.phone,
      email: req.body.email,
    };
    if (req.file) {
      updateData.profilePhoto = req.file.filename;
    }
    await User.findByIdAndUpdate(userId, updateData);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
