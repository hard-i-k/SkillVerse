// routes/authRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  register, 
  login, 
  googleAuth, 
  getMe, 
  forgotPassword, 
  validateResetToken, 
  resetPassword 
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);    // 🔓 Public - User registration
router.post('/login', login);          // 🔓 Public - User login
router.post('/google', googleAuth);    // 🔓 Public - Google OAuth
router.post('/forgot-password', forgotPassword);  // 🔓 Public - Forgot password
router.get('/reset-password/:token', validateResetToken);  // 🔓 Public - Validate reset token
router.post('/reset-password/:token', resetPassword);  // 🔓 Public - Reset password

// Protected routes
router.get('/me', protect, getMe);     // 🔒 Protected - Get current user

export default router;
