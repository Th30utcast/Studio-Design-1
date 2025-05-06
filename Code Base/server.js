const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings'); 
const ratingRoutes = require('./routes/ratings');
const path = require('path');

dotenv.config();
const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use('/ratings', ratingRoutes);
app.get('/', (req, res) => {
  res.redirect('/HTML/main_page.html');
});


mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homequest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes); 
app.use('/uploads', express.static('public/uploads'));


mongoose.connection.on('connected', () => {
  console.log('Connected to collection:', mongoose.connection.collections.listings?.collectionName);
  mongoose.connection.db.collection('listings').find({}).toArray()
  .then(docs => console.log(`Found ${docs.length} listings`))
  .catch(err => console.error("Query failed:", err)); 
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});