import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { clearData } from '../controllers/adminController.js';

const router = express.Router();

// @desc    Clear all courses and blogs
// @route   DELETE /api/admin/clear-data
// @access  Private/Admin
router.delete('/clear-data', protect, isAdmin, clearData);

export default router; 