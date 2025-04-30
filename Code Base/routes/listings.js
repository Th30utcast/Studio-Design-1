const express = require('express');
const router = express.Router();

const multer = require('multer');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const { 
      listingType, 
      location,
      minPrice,
      maxPrice,
      bedrooms
    } = req.query;

    const filters = {};
    if (listingType) filters.listingType = listingType;
    if (location) filters.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    if (bedrooms) filters.bedrooms = { $gte: Number(bedrooms) };

    const listings = await Listing.find(filters);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});


// POST /api/listings/add
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
      location,
      description
    } = req.body;

    const user = await User.findById(sellerId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can add listings.' });
    }

    // Listing limit check
    if (user.membership !== 'gold') {
      const listingCount = await Listing.countDocuments({ sellerId });
      if (listingCount >= 3) {
        return res.status(400).json({ error: 'You have reached the listing limit for your membership plan.' });
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
    res.status(201).json({ message: 'Listing added successfully.' });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
});



module.exports = router;
