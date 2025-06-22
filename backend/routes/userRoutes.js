import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';
import { getDashboard, updateProfile, getUserProfile, updateAvatar, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

// Specific routes first
router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, uploadAvatar, updateAvatar);

// List all users (public, for teammates search)
router.get('/', getAllUsers);

// Parameterized routes last
router.get('/:userId/profile', getUserProfile);

export default router; 