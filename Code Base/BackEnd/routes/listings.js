const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      location,
      minPrice, 
      maxPrice, 
      bedrooms, 
      bathrooms,
      listingType // 'buy' or 'rent'
    } = req.query;

    // Build the filter object
    const filters = {};

    // Text search (searches both name and location)
    if (search) {
      filters.$or = [
        { Name: new RegExp(search, 'i') },
        { Location: new RegExp(search, 'i') }
      ];
    }

    // Location-only filter
    if (location) {
      filters.Location = new RegExp(location, 'i');
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.Price = {};
      if (minPrice) filters.Price.$gte = Number(minPrice);
      if (maxPrice) filters.Price.$lte = Number(maxPrice);
    }

    // Bedrooms filter
    if (bedrooms) {
      filters.Bedrooms = Number(bedrooms);
    }

    // Bathrooms filter
    if (bathrooms) {
      filters.Bathrooms = Number(bathrooms);
    }

    // Listing type filter
    if (listingType) {
      filters.ListingType = listingType.toLowerCase(); // 'buy' or 'rent'
    }

    console.log('Search filters:', filters); // For debugging

    const listings = await Listing.find(filters);
    res.json(listings);

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

module.exports = router;