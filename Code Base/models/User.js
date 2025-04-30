const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  address: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // New stuff you're adding:
  membership: { type: String, default: 'Standard' }, // Standard or Gold
  photo: { type: String, default: '' }, // Path to uploaded photo
  isVerified: { type: Boolean, default: false }, // Verification status

  loginAttempts: [
    {
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
