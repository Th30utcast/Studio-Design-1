// routes/ratings.js
const express = require('express');
const router = express.Router();
const Rating = require('../models/rating');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Submit a new rating
router.post('/submit', auth, async (req, res) => {
    try {
      console.log("Full req.user:", req.user);
      console.log("Full req.body:", req.body);
  
      const userId = req.user.id.trim();
      const buyerId = req.body.buyer.trim();
  
      if (userId !== buyerId) {
        console.error("ID mismatch!");
        return res.status(403).json({ message: 'Not authorized to submit this rating' });
      }
  
      try {
        const userInDb = await User.findById(userId);
        if (!userInDb) {
          console.error("User not found in database:", userId);
          return res.status(404).json({ message: 'User not found in database' });
        }
      } catch (dbError) {
        console.error("Database error when checking user:", dbError);
        return res.status(500).json({ message: 'Database error', error: dbError.message });
      }
  
      // ✅ Use correct field names: buyer, seller, listing
      const existingRating = await Rating.findOne({
        buyer: req.body.buyer,
        seller: req.body.seller,
        listing: req.body.listing
      });
  
      if (existingRating) {
        existingRating.stars = req.body.stars;
        existingRating.comment = req.body.comment;
        await existingRating.save();
        return res.status(200).json(existingRating);
      }
  
      const rating = new Rating({
        buyer: req.body.buyer,
        seller: req.body.seller,
        listing: req.body.listing,
        stars: req.body.stars,
        comment: req.body.comment
      });
  
      await rating.save();
      res.status(201).json(rating);
  
    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Get ratings for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const ratings = await Rating.find({ sellerId: req.params.sellerId })
      .sort({ createdAt: -1 }); // Most recent first
    
    // Calculate average rating
    const averageRating = await Rating.getAverageRating(req.params.sellerId);
    
    res.status(200).json({
      ratings,
      count: ratings.length,
      averageRating: parseFloat(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific rating by ID
router.get('/:id', async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    res.status(200).json(rating);
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a rating (only by the user who created it)
router.delete('/:id', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if the user is authorized to delete this rating
    if (rating.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }
    
    await rating.remove();
    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;