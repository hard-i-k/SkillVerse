import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiUser, FiLock, FiCheck, FiEdit, FiArrowRight, FiPlay, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setCourse(data);
    } catch (err) {
      console.error('Failed to fetch course details:', err);
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollFree = async () => {
    setEnrolling(true);
    try {
      await api.post('/courses/enroll', { courseId });
      toast.success('Successfully enrolled!');
      // Refresh course details to update enrollment status
      await fetchCourseDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully!');
      navigate('/courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Course not found</p>
          <Link to="/courses" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const renderActionButtons = () => {
    if (course.isCreator) {
      return (
        <div className="flex gap-4 mt-8">
          <Link
            to={`/courses/${courseId}/content`}
            className="flex-1 bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiPlay className="text-lg" />
            View Content
          </Link>
          <Link
            to={`/courses/${courseId}/edit`}
            className="flex-1 bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiEdit className="text-lg" />
            Edit Course
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="text-lg" />
                Delete Course
              </>
            )}
          </button>
        </div>
      );
    }

    if (course.isEnrolled) {
      return (
        <Link
          to={`/courses/${courseId}/content`}
          className="w-full bg-green-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-8"
        >
          <FiCheck className="text-lg" />
          Continue Learning
        </Link>
      );
    }

    if (course.isPaid) {
      return (
        <Link
          to={`/courses/${courseId}/pay`}
          className="w-full bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-8"
        >
          <FiLock className="text-lg" />
          Pay ₹{course.price} to Enroll
        </Link>
      );
    }

    return (
      <button
        onClick={handleEnrollFree}
        disabled={enrolling}
        className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
      >
        {enrolling ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Enrolling...
          </>
        ) : (
          <>
            <FiCheck className="text-lg" />
            Enroll for Free
          </>
        )}
      </button>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          {/* Header Section */}
          <div className={`p-8 ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-1">
                    <FiUser />
                    <span>Created by:</span>
                    <Link 
                      to={`/profile/${course.creator?._id}`} 
                      className="hover:underline font-medium"
                    >
                      {course.creator?.name || 'Anonymous'}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-300" />
                    <span>{course.averageRating?.toFixed(1) || 'N/A'} ({course.ratings?.length || 0} ratings)</span>
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${course.isPaid ? 'text-green-300' : 'text-green-200'}`}>
                {course.isPaid ? `₹${course.price}` : 'Free'}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Course Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">About This Course</h2>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {course.description}
              </p>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-2xl font-bold text-blue-600">{course.chapters?.length || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chapters</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-2xl font-bold text-green-600">{course.category || 'General'}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-2xl font-bold text-purple-600">{course.level || 'Beginner'}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Level</div>
              </div>
            </div>

            {/* User Status */}
            {course.isCreator && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-center gap-2">
                  <FiEdit className="text-blue-600" />
                  <span className="font-semibold text-blue-600">You are the creator of this course</span>
                </div>
              </div>
            )}

            {course.isEnrolled && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-green-600" />
                  <span className="font-semibold text-green-600">You are enrolled in this course</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {renderActionButtons()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetails; 