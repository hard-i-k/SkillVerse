import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  createCourse,
  addChapter,
  addQuizToChapter,
  listCourses,
  getCourse,
  listAvailableCourses,
  enrollInCourse,
  getCourseContent,
  markChapterComplete,
  updateCourse,
  updateChapter,
  deleteChapter,
  reorderChapters,
  rateCourse,
  deleteCourse
} from '../controllers/courseController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── 🔒 Now Protected to Access req.user ────────────────────────
router.get('/', protect, listCourses); // ✅ Apply 'protect' so we can mark enrolled courses

// ─── 🔒 Protected User Routes ──────────────────────────────────
router.get('/available/courses', protect, listAvailableCourses);
router.get('/:courseId/content', protect, getCourseContent);
router.post('/:courseId/chapter/:chapterId/complete', protect, markChapterComplete);

// ─── 💳 Enrollment ───────────────────────────────────
router.post('/enroll', protect, enrollInCourse);
router.post('/:courseId/rate', protect, rateCourse);

// ─── 🧑‍🏫 Course Management (Instructor Only) ───────────────────
router.post('/', protect, createCourse);
router.put('/:courseId', protect, updateCourse);
router.delete('/:courseId', protect, deleteCourse);

// ─── 📘 Chapter Management ─────────────────────────────────────
router.post('/:courseId/chapters', protect, upload, addChapter);
router.put('/:courseId/chapters/:chapterId', protect, upload, updateChapter);
router.delete('/:courseId/chapters/:chapterId', protect, deleteChapter);
router.put('/:courseId/reorder-chapters', protect, reorderChapters);

// ─── ❓ Quiz Management ─────────────────────────────────────────
router.post('/:courseId/chapters/:chapterId/quiz', protect, addQuizToChapter);

// ─── 📦 Keep this last to prevent route conflicts ─────────────
router.get('/:courseId', getCourse); // Public: Get single course details

export default router;
