// middleware/auth.js tokern verification
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token') || 
                  req.headers.authorization?.split(' ')[1] || 
                  req.cookies?.token;
  
    console.log("Token received:", token);
  
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      req.user = decoded.user;
      next();
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };