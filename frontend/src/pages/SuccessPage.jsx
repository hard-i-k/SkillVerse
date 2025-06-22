import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiHome, FiArrowRight } from 'react-icons/fi';
import { verifyStripeSession } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const SuccessPage = () => {
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');
    const [courseId, setCourseId] = useState(null);
    const location = useLocation();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const searchParams = new URLSearchParams(location.search);
    const stripeSessionId = searchParams.get('session_id');
    const urlCourseId = searchParams.get('courseId');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (!stripeSessionId) {
                    throw new Error('No session ID found');
                }

                const res = await verifyStripeSession(stripeSessionId, urlCourseId);
                setMessage('Payment Successful! You are now enrolled.');
                setStatus('success');
                setCourseId(res.data.courseId);
            } catch (error) {
                console.error("Payment verification failed:", error);
                setMessage('Payment verification failed. Please contact support if this issue persists.');
                setStatus('error');
            }
        };

        verifyPayment();
    }, [stripeSessionId, urlCourseId]);

    const getIcon = () => {
        if (status === 'verifying') return <FiCheckCircle className="text-blue-500 text-6xl animate-pulse" />;
        if (status === 'success') return <FiCheckCircle className="text-green-500 text-6xl" />;
        return <FiXCircle className="text-red-500 text-6xl" />;
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`text-center p-10 rounded-2xl shadow-2xl max-w-lg w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <div className="mb-6">
                    {getIcon()}
                </div>
                <h1 className="text-3xl font-bold mb-4">
                    {status === 'success' ? 'Payment Successful!' : status === 'error' ? 'Payment Failed!' : 'Verifying Payment...'}
                </h1>
                <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                
                {status === 'success' && courseId && (
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to={`/courses/${courseId}/content`} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                            Start Learning <FiArrowRight />
                        </Link>
                        <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all">
                            Go to Dashboard <FiHome />
                        </Link>
                    </div>
                )}
                {status === 'error' && (
                    <Link to="/courses" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all">
                        Browse Courses <FiHome />
                    </Link>
                )}
            </motion.div>
        </div>
    );
};

export default SuccessPage;
