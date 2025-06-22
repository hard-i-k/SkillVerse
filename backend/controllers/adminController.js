import Course from '../models/Course.js';
import Blog from '../models/Blog.js';

// @desc    Clear all courses and blogs from the database
// @route   DELETE /api/admin/clear-data
// @access  Private/Admin
export const clearData = async (req, res) => {
  try {
    const courseDeletion = await Course.deleteMany({});
    const blogDeletion = await Blog.deleteMany({});

    res.status(200).json({
      message: 'Database cleared successfully.',
      deletedCourses: courseDeletion.deletedCount,
      deletedBlogs: blogDeletion.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while clearing data.', error: error.message });
  }
}; 