const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  photos: [String],      // Array of image paths
  location: String,      // "Cyprus, Ayla Napa"
  details: String,       // "240 sqm"
  price: Number,         
  bedrooms: Number,
  bathrooms: Number,
}, { collection: 'listings' });

module.exports = mongoose.model('Listing', listingSchema);