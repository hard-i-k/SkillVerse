import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiLink, FiAward, FiCode, FiArrowLeft, FiUser, FiMail } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const UserProfile = () => {
  const { userId } = useParams();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get(`/users/${userId}/profile`);
      setUser(data.user);
      setCreatedCourses(data.createdCourses || []);
      setEnrolledCourses(data.enrolledCourses || []);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>User not found</p>
          <Link to="/courses" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          to="/courses"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mb-8 ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
              : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
        >
          <FiArrowLeft />
          Back to Courses
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          {/* Header Section */}
          <div className={`p-8 ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img 
                src={user.avatar || 'https://via.placeholder.com/120x120?text=User'} 
                alt={user.name} 
                className="w-28 h-28 rounded-full border-4 border-white/20 shadow-lg" 
              />
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-4 text-white/80 mb-4">
                  <div className="flex items-center gap-1">
                    <FiMail />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="flex justify-center md:justify-start gap-4">
                  {user.profileLinks?.github && (
                    <a href={user.profileLinks.github} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                      <FiGithub size={22} />
                    </a>
                  )}
                  {user.profileLinks?.linkedin && (
                    <a href={user.profileLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                      <FiLinkedin size={22} />
                    </a>
                  )}
                  {user.profileLinks?.leetcode && (
                    <a href={user.profileLinks.leetcode} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                      <FiLink size={22} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Skills Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiCode className="text-blue-500" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(user.skills || []).length > 0 ? (
                  user.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No skills listed.</p>
                )}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiAward className="text-yellow-500" />
                Achievements
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {(user.achievements || []).length > 0 ? (
                  user.achievements.map((achievement, i) => (
                    <li key={i} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {achievement}
                    </li>
                  ))
                ) : (
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No achievements listed.</p>
                )}
              </ul>
            </div>

            {/* Created Courses Section */}
            {createdCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiUser className="text-green-500" />
                  Created Courses ({createdCourses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {createdCourses.map((course) => (
                    <Link
                      key={course._id}
                      to={`/courses/${course._id}`}
                      className={`p-4 rounded-lg border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {course.description.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-sm ${course.isPaid ? 'text-green-500' : 'text-blue-500'}`}>
                          {course.isPaid ? `₹${course.price}` : 'Free'}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {course.chapters?.length || 0} chapters
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Enrolled Courses Section */}
            {enrolledCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiAward className="text-purple-500" />
                  Enrolled Courses ({enrolledCourses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map((course) => (
                    <Link
                      key={course._id}
                      to={`/courses/${course._id}/content`}
                      className={`p-4 rounded-lg border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {course.description.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-sm ${course.isPaid ? 'text-green-500' : 'text-blue-500'}`}>
                          {course.isPaid ? `₹${course.price}` : 'Free'}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {course.chapters?.length || 0} chapters
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile; 