const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: String,
  address: String,
  userType: { type: String, enum: ['buyer', 'seller'], required: true },
  membership: { type: String, enum: ['gold', 'silver'], default: 'silver' }, // Only applies to sellers
  profilePhoto: { type: String, default: "" },
  loginAttempts: [{ date: { type: Date, default: Date.now } }]
}, { collection: 'users' });

module.exports = mongoose.model("User", userSchema);
