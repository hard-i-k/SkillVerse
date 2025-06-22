// src/pages/Courses/StripeRedirect.jsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyStripeSession } from '../../utils/api';
import { Loader2 } from 'lucide-react';

const StripeRedirect = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('courseId');
  const [status, setStatus] = useState('Verifying payment...');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Missing auth token');

        // ✅ Send courseId as query param, not request body
        const { data } = await verifyStripeSession(sessionId, courseId);

        setStatus('✅ Payment verified and course enrolled!');
        setTimeout(() => {
          navigate(`/courses/${courseId}/content`);
        }, 2000);
      } catch (error) {
        console.error(error);
        setStatus('❌ Payment verification failed. Please contact support.');
      }
    };

    if (sessionId && courseId) {
      verifyPayment();
    } else {
      setStatus('⚠️ Missing payment or course information.');
    }
  }, [sessionId, courseId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold">{status}</h2>
        {status.includes('verified') && (
          <p className="mt-2 text-sm text-green-600">Redirecting to course...</p>
        )}
      </div>
    </div>
  );
};

export default StripeRedirect;
