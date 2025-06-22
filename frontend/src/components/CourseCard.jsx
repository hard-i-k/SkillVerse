import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiShare2, FiUser, FiArrowRight, FiLock, FiCheck, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const CourseCard = ({ course, onEnrollmentChange, onCourseDelete }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/courses/${course._id}/content`;
    try {
      if (navigator.share) {
        await navigator.share({ title: course.title, text: `Check out this course: ${course.title}`, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Course link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Could not share course.');
    }
  };
  
  const handleEnrollFree = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEnrolling(true);
    try {
      await api.post('/courses/enroll', { courseId: course._id });
      toast.success(`Successfully enrolled in ${course.title}!`);
      onEnrollmentChange(course._id, true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll.');
      onEnrollmentChange(course._id, false);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.delete(`/courses/${course._id}`);
      toast.success('Course deleted successfully!');
      if (onCourseDelete) {
        onCourseDelete(course._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const renderActionButtons = () => {
    if (course.isCreator) {
      return (
        <div className="mt-6 flex items-center gap-4">
          <Link
            to={`/courses/${course._id}/content`}
            className="flex-1 text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiArrowRight className="mr-2" /> View Content
          </Link>
          <Link
            to={`/courses/${course._id}/edit`}
            className="flex-1 text-center bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <FiEdit className="mr-2" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 text-center bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <FiTrash2 className="mr-2" /> {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      );
    }

    if (course.isEnrolled) {
      return (
        <Link
          to={`/courses/${course._id}/content`}
          className="mt-6 w-full text-center bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <FiCheck className="mr-2" /> View Content
        </Link>
      );
    }

    if (course.isPaid) {
      return (
        <Link
          to={`/courses/${course._id}/pay`}
          className="mt-6 w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <FiLock className="mr-2" /> Pay to Enroll
        </Link>
      );
    }

    return (
      <button
        onClick={handleEnrollFree}
        disabled={isEnrolling}
        className="mt-6 w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
      >
        {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
      </button>
    );
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`flex flex-col rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border p-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow">
          <h2 className="text-xl font-bold mb-1">{course.title}</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiUser />
            <span>Created by:</span>
            <Link to={`/profile/${course.creator?._id}`} className="hover:underline font-medium text-blue-500">
              {course.creator?.name || 'Anonymous'}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {course.isCreator && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 disabled:opacity-50"
              aria-label="Delete course"
            >
              <FiTrash2 />
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Share course"
          >
            <FiShare2 className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <FiStar className="text-yellow-400" />
          <span className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {course.averageRating?.toFixed(1) || 'N/A'}
          </span>
          <span className="text-xs text-gray-500">({course.ratings?.length || 0} ratings)</span>
        </div>
        <div className={`text-base font-bold ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
          {course.isPaid ? `₹${course.price}` : 'Free'}
        </div>
      </div>
      
      <p className={`text-sm mb-4 flex-grow min-h-[60px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {course.description.substring(0, 150)}{course.description.length > 150 && '...'}
      </p>

      {renderActionButtons()}
    </motion.div>
  );
};

export default CourseCard; 