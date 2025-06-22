import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPlus, FiEye, FiHome, FiArrowRight } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';

const CourseCreatedPage = () => {
  const { courseId } = useParams();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.6 }}
          className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 shadow-2xl"
        >
          <FiCheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-6"
        >
          🎉 Course Created Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`text-lg mb-12 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Your course shell is ready. The next step is to add chapters and content.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button asChild>
            <Link to={`/courses/${courseId}/manage-chapters`}>
              <FiPlus className="mr-2" />
              Add/Manage Chapters
            </Link>
          </Button>

          <Button asChild variant="secondary">
            <Link to={`/courses/${courseId}/content`}>
              <FiEye className="mr-2" />
              Preview Course
            </Link>
          </Button>
        </motion.div>

        {/* Secondary Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 transition-colors duration-300 group ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              <FiHome className="group-hover:scale-110" />
              <span>Back to Dashboard</span>
            </Link>

            <Link
              to="/"
              className={`flex items-center gap-2 transition-colors duration-300 group ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              <FiArrowRight className="group-hover:translate-x-1" />
              <span>Go to Home</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CourseCreatedPage;
