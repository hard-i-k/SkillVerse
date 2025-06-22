import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Auth Middleware Error:', err.message);
    return res.status(401).json({ success: false, message: 'Unauthorized', error: err.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized for this route`,
      });
    }
    next();
  };
};

export const isVerified = (req, res, next) => {
  if (!req.user || !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email before accessing this route',
    });
  }
  next();
};
