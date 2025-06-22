// blogRoutes.js (ES Module compatible)
import express from 'express';
import {
  createBlog,
  getAllBlogs,
  deleteBlog,
  voteBlog,
} from '../controllers/blogController.js';

// ✅ Replace with your actual auth middleware if you have one
import { protect } from '../middleware/authMiddleware.js'; // assume this adds req.user

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);

// ✅ Protected routes (create, delete, vote)
router.post('/',protect , createBlog);
router.delete('/:id', protect, deleteBlog);
router.patch('/:id/vote', protect, voteBlog);

export default router;
