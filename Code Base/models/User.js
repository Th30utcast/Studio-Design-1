const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: String,
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, required: true }
},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['buyer', 'seller'], required: true },
  membership: { type: String, enum: ['silver', 'gold'], default: 'silver' },
  isVerified: { type: Boolean, default: false },
  photo: { type: String, default: "/uploads/default-profile.png" },
  dataConsent: { type: Boolean, default: false },
  loginAttempts: [{ date: { type: Date, default: Date.now } }]
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);
