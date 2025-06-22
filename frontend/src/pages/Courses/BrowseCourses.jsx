import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import CourseCard from '../../components/CourseCard';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses?q=${searchTerm}`);
      setCourses(data.courses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
        fetchCourses();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);

  const handleEnrollmentChange = (courseId, isEnrolled) => {
    if (isEnrolled) {
      setCourses(currentCourses =>
        currentCourses.map(c =>
          c._id === courseId ? { ...c, isEnrolled: true } : c
        )
      );
    }
  };

  const handleCourseDelete = (courseId) => {
    setCourses(currentCourses =>
      currentCourses.filter(c => c._id !== courseId)
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className={`min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8 ${
      isDarkMode
        ? 'bg-gradient-to-b from-gray-900 to-black'
        : 'bg-gradient-to-b from-gray-50 to-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className={`text-5xl font-extrabold mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
            isDarkMode 
              ? 'from-blue-400 to-cyan-300' 
              : 'from-blue-600 to-cyan-500'
          }`}>
            Explore Our Courses
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Find your next learning adventure. New skills are just a click away.
          </p>
        </motion.div>

        <div className="mb-12 max-w-xl mx-auto">
          <div className="relative">
            <FiSearch className={`absolute top-1/2 left-4 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search by title, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-3 pl-12 pr-10 rounded-full border transition-all duration-300 shadow-md ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/50`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute top-1/2 right-4 -translate-y-1/2"
              >
                <FiX className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="text-4xl text-blue-500 animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {courses.map(course => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  onEnrollmentChange={handleEnrollmentChange}
                  onCourseDelete={handleCourseDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {!loading && courses.length === 0 && (
            <div className="text-center py-20">
                <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No courses found. Try a different search term!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCourses;
