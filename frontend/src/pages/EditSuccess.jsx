// pages/EditSuccess.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiEdit, FiEye, FiHome, FiArrowRight } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const EditSuccess = () => {
  const { courseId } = useParams();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-10 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="text-center max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.6 }}
          className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-2xl"
        >
          <FiCheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6"
        >
          Course Updated Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`text-xl mb-12 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Your changes have been saved. You can continue managing your course or return to the dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to={`/courses/${courseId}/manage-chapters`}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FiEdit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold">Manage Chapters</span>
          </Link>

          <Link
            to={`/courses/${courseId}`}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FiEye className="w-5 h-5" />
            <span className="font-semibold">View Course</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="flex justify-center">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-6 py-3 transition-colors duration-300 group ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="underline hover:no-underline">Back to Dashboard</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditSuccess;
