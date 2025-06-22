import User from '../models/User.js';

// Middleware to check if the user is the designated admin
export const isAdmin = (req, res, next) => {
  // Check if user is logged in and is the specific admin
  if (req.user && req.user.email === 'hardikcp5@gmail.com') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }
}; 