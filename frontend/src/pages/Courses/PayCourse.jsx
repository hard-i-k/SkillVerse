import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiCheck, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { createCheckoutSession, getCourse } from '../../utils/api';

const PayCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [course, setCourse] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await getCourse(courseId);
        setCourse(data);
        setIsEnrolled(data.isEnrolled || false);
        setIsCreator(data.isCreator || false);
      } catch (err) {
        console.error('⚠️ Failed to fetch course info', err);
        toast.error('Failed to load course information');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [courseId, navigate]);

  const handleStripePay = async () => {
    setProcessing(true);
    try {
      const { data } = await createCheckoutSession(courseId);

      if (data?.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Something went wrong during payment setup.';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Checking your course access...</p>
        </div>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-8 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-2xl text-green-600" />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            You're already enrolled!
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You have access to this course content.
          </p>
          <Link
            to={`/courses/${courseId}/content`}
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Continue Learning
          </Link>
        </motion.div>
      </div>
    );
  }

  if (isCreator) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-8 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-2xl text-blue-600" />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            You're the course creator!
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You have full access to manage and view this course.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to={`/courses/${courseId}/content`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Content
            </Link>
            <Link
              to={`/courses/${courseId}/edit`}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Edit Course
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          to={`/courses/${courseId}`}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mb-8 ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
              : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
        >
          <FiArrowLeft />
          Back to Course
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          {/* Header */}
          <div className={`p-8 ${isDarkMode ? 'bg-gradient-to-r from-purple-900 to-blue-900' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="text-3xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Complete Your Enrollment</h1>
              <p className="text-white/80">Secure payment powered by Stripe</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {course && (
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {course.title}
                </h2>
                <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {course.description}
                </p>
                
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Price:</span>
                    <span className="text-2xl font-bold text-green-600">₹{course.price}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <FiCheck className="text-green-500 text-xl" />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Lifetime access to all course content
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheck className="text-green-500 text-xl" />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Interactive quizzes and assessments
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheck className="text-green-500 text-xl" />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Progress tracking and certificates
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiCheck className="text-green-500 text-xl" />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Secure payment processing
                </span>
              </div>
            </div>

            {/* Test Card Instructions */}
            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                🧪 Test Payment (Stripe Sandbox)
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                Use this test card number: <strong>4242 4242 4242 4242</strong>
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                Any future expiry date and any 3-digit CVV will work.
              </p>
            </div>

            <button
              onClick={handleStripePay}
              disabled={processing}
              className="w-full bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiLock className="text-lg" />
                  Pay ₹{course?.price} & Enroll Now
                </>
              )}
            </button>

            <p className={`text-xs text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your payment is secure and encrypted. You'll be redirected to Stripe for payment processing.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PayCourse;
