// models/Listing.js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingType: { type: String, enum: ['rent', 'purchase'], required: true },
  apartmentType: { type: String, enum: ['residential', 'commercial'], required: true },
  duration: { type: String }, // only for rent
  price: { type: Number, required: true },
  size: { type: String }, // e.g. "120 sqm"
  bedrooms: Number,
  bathrooms: Number,
  location: { type: String, required: true },
  description: String,
  photos: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
