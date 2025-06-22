import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Input, TextArea, Select, Button, Card } from '../components/ui/FormElements';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiBook, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: 'beginner',
    paymentType: 'free', // free or paid
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const isPaid = formData.paymentType === 'paid';
    const finalPrice = isPaid ? Number(formData.price) : 0;
  
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      level: formData.level,
      isPaid: isPaid, // ✅ send this to backend
      price: finalPrice,
      payoutDetails: {
        upiId: formData.upiId,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      },
    };
  
    const hasBankDetails =
      formData.bankName && formData.accountNumber && formData.ifscCode;
    const hasUPI = formData.upiId;
  
    if (isPaid && !(hasBankDetails || hasUPI)) {
      toast.error('For paid courses, provide UPI or full bank details');
      setLoading(false);
      return;
    }
  
    try {
      const { data } = await api.post('/courses', payload);
      toast.success('🎉 Course created successfully!');
      navigate(`/add-chapters/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };
  

  const isPaid = formData.paymentType === 'paid';

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
          >
            <FiBook className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            Create Your Course
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Share your knowledge with the world and inspire learners everywhere
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Card className={`mb-8 backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-white/5 border-white/20 shadow-2xl' 
              : 'bg-white/60 border-gray-200 shadow-xl'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Input
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., The Ultimate React Masterclass"
                  required
                  disabled={loading}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <TextArea
                  label="Course Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what your course is about..."
                  required
                  disabled={loading}
                  rows={4}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Input
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Web Development"
                  required
                  disabled={loading}
                  isDarkMode={isDarkMode}
                />
                <Select
                  label="Difficulty Level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  options={levels}
                  required
                  disabled={loading}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="relative"
              >
                <Select
                  label="Course Type"
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  options={[
                    { value: 'free', label: 'Free Course' },
                    { value: 'paid', label: 'Paid Course' },
                  ]}
                  disabled={loading}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              {isPaid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className={`space-y-6 p-6 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-700' 
                      : 'bg-green-50/50 border-green-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                      Payment Settings
                    </h3>
                  </div>
                  
                  <Input
                    label="Price (INR)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 499"
                    required
                    min="1"
                    disabled={loading}
                    isDarkMode={isDarkMode}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Bank Name"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      disabled={loading}
                      isDarkMode={isDarkMode}
                    />
                    <Input
                      label="Account Number"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      disabled={loading}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  
                  <Input
                    label="IFSC Code"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    disabled={loading}
                    isDarkMode={isDarkMode}
                  />

                  <div className="text-center text-gray-400 my-2">OR</div>

                  <Input
                    label="UPI ID"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    disabled={loading}
                    isDarkMode={isDarkMode}
                  />
                  
                  <div className={`flex items-start gap-2 p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-blue-900/30 border-blue-800/60' 
                      : 'bg-blue-50/50 border-blue-200'
                  }`}>
                    <FiCheckCircle className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5 flex-shrink-0`} />
                    <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Provide either full bank details or UPI ID for receiving payments.
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex justify-end space-x-4 pt-6"
              >
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => navigate(-1)} 
                  disabled={loading}
                  className="px-6 py-3"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create Course
                      <FiArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCourse;
