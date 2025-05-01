const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET /api/listings - with filters
router.get('/', async (req, res) => {
  try {
    const {
      listingType,
      apartmentType,
      country,
      state,
      city,
      postalCode,
      minPrice,
      maxPrice,
      bedrooms,
      duration,
      verified
    } = req.query;

    const filters = {};

    // Location filters using strict case-insensitive match
    if (country) filters["location.country"] = new RegExp(`^${country.trim()}$`, 'i');
    if (state) filters["location.state"] = new RegExp(`^${state.trim()}$`, 'i');
    if (city) filters["location.city"] = new RegExp(`^${city.trim()}$`, 'i');
    if (postalCode) filters["location.postalCode"] = new RegExp(`^${postalCode.trim()}$`, 'i');

    // Price range
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    // Other filters
    if (bedrooms) filters.bedrooms = { $gte: Number(bedrooms) };
    if (listingType) filters.listingType = listingType;
    if (apartmentType) filters.apartmentType = apartmentType;
    if (duration && listingType === "rent") {
      filters.duration = new RegExp(`^${duration.trim()}$`, 'i');
    }

    // Fetch listings
    let listings = await Listing.find(filters).lean();

    // If verified only, filter by seller's verification
    if (verified === "true") {
      const verifiedSellerIds = await User.find({ isVerified: true, userType: "seller" }).distinct('_id');
      listings = listings.filter(listing =>
        verifiedSellerIds.some(id => id.toString() === listing.sellerId.toString())
      );
    }

    res.json(listings);
  } catch (err) {
    console.error("Listing fetch error:", err);
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
    } catch (err) {
      return res.status(400).json({ error: 'Invalid location format. Must be JSON.' });
    }

    const user = await User.findById(sellerId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can add listings.' });
    }

    // Limit for Silver members
    if (user.membership !== 'gold') {
      const count = await Listing.countDocuments({ sellerId });
      if (count >= 3) {
        return res.status(400).json({ error: 'Listing limit reached for Silver members.' });
      }
    }

    const photoPaths = req.files.map(file => `/uploads/${file.filename}`);

    const newListing = new Listing({
      sellerId,
      listingType,
      apartmentType,
      duration: listingType === "rent" ? duration : undefined,
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
    console.error("Create listing error:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
