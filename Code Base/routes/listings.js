const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/listings - fetch with filters
router.get('/', async (req, res) => {
  try {
    const { listingType, location, minPrice, maxPrice, bedrooms } = req.query;
    const filters = {};

    if (listingType) filters.listingType = listingType;

    if (location) {
      filters["location.city"] = new RegExp(location, 'i'); // case-insensitive partial match
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (bedrooms) filters.bedrooms = { $gte: Number(bedrooms) };

    const listings = await Listing.find(filters);
    res.json(listings);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/listings/:id - single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error("Single fetch error:", err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// POST /api/listings/add - add new listing
router.post('/add', upload.array('photos', 5), async (req, res) => {
  try {
    const {
      sellerId,
      listingType,
      apartmentType,
      duration,
      price,
      size,
      bedrooms,
      bathrooms,
      description
    } = req.body;

    let location = {};
    try {
      location = JSON.parse(req.body.location);
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid location format. Expecting JSON.' });
    }

    const user = await User.findById(sellerId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can add listings.' });
    }

    if (user.membership !== 'gold') {
      const listingCount = await Listing.countDocuments({ sellerId });
      if (listingCount >= 3) {
        return res.status(400).json({ error: 'Listing limit reached for Silver members.' });
      }
    }

    const photoPaths = req.files.map(file => `/uploads/${file.filename}`);

    const newListing = new Listing({
      sellerId,
      listingType,
      apartmentType,
      duration: listingType === 'rent' ? duration : undefined,
      price,
      size,
      bedrooms,
      bathrooms,
      location,
      description,
      photos: photoPaths
    });

    await newListing.save();
    res.status(201).json({ message: 'Listing added successfully.', listing: newListing });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
});

module.exports = router;
