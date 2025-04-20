const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  address: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loginAttempts: [{
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('User', userSchema);
