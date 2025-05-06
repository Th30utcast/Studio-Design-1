const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const verifyToken = require('../middleware/auth');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ================== GET Listings with filters ==================
router.get('/', async (req, res) => {
  try {
    const {
      sellerId,
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

    if (sellerId) filters.sellerId = sellerId;
    if (country) filters["location.country"] = new RegExp(country, 'i');
    if (state) filters["location.state"] = new RegExp(state, 'i');
    if (city) filters["location.city"] = new RegExp(city, 'i');
    if (postalCode) filters["location.postalCode"] = new RegExp(postalCode, 'i');

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (bedrooms) filters.bedrooms = { $gte: Number(bedrooms) };
    if (listingType) filters.listingType = listingType;
    if (apartmentType) filters.apartmentType = apartmentType;
    if (duration && listingType === "rent") filters.duration = new RegExp(duration, 'i');

    let listings = await Listing.find(filters).lean();

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

// ================== GET Single Listing ==================
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

// ================== ADD Listing (Protected) ==================
router.post('/add', verifyToken, upload.array('photos', 5), async (req, res) => {
  try {
    const {
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

    const userId = req.user.id;
    const userType = req.user.userType;

    if (userType !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can add listings.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid ObjectId:", userId);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(userId);
    console.log("🔍 Checking user:", sellerObjectId);

    const user = await User.findById(sellerObjectId);
    if (!user) {
      console.error("❌ User not found for ID:", sellerObjectId);
      return res.status(404).json({ error: 'Seller not found.' });
    }

    if (user.membership !== 'gold') {
      const count = await Listing.countDocuments({ sellerId: sellerObjectId });
      if (count >= 3) {
        return res.status(400).json({ error: 'Listing limit reached for Silver members.' });
      }
    }

    const photoPaths = req.files.map(file => `/uploads/${file.filename}`);

    const newListing = new Listing({
      sellerId: sellerObjectId,
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

// ================== UPDATE Listing ==================
router.put('/:id', async (req, res) => {
  try {
    const listingId = req.params.id;
    const {
      price,
      duration,
      size,
      bedrooms,
      bathrooms,
      description
    } = req.body;

    const updatedFields = {};
    if (price) updatedFields.price = price;
    if (duration) updatedFields.duration = duration;
    if (size) updatedFields.size = size;
    if (bedrooms) updatedFields.bedrooms = bedrooms;
    if (bathrooms) updatedFields.bathrooms = bathrooms;
    if (description) updatedFields.description = description;

    const updated = await Listing.findByIdAndUpdate(listingId, { $set: updatedFields }, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    res.status(200).json({ message: 'Listing updated successfully.', listing: updated });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ error: 'Failed to update listing.' });
  }
});

module.exports = router;