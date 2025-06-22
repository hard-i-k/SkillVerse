import React, { useState, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/FormElements';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSend, FiEdit3, FiTag, FiType, FiUser } from 'react-icons/fi';

const CreateBlog = () => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handlePost = async () => {
    if (!title || !tag || !content) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const blogData = {
        title,
        tag,
        content,
        author: user?.name || 'Anonymous',
      };
      await createBlog(blogData);
      toast.success('Blog posted successfully!');
      setTitle('');
      setTag('');
      setContent('');
      navigate('/blogs');
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToAllBlogs = () => {
    navigate('/blogs');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              ✨ Create Your Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Share your thoughts, ideas, and stories with the world
            </p>
          </motion.div>

          {/* Main Form Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            {/* Glassmorphism Card */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 hover:opacity-20 transition-opacity duration-500" />
              
              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-10 right-10 text-4xl opacity-20"
              >
                ✍️
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute bottom-10 left-10 text-3xl opacity-20"
              >
                📝
              </motion.div>

              <div className="relative z-10 space-y-8">
                {/* Title Input */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <label className="flex items-center gap-3 text-xl font-semibold text-white">
                    <FiType className="text-purple-400 text-2xl" />
                    Blog Title
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter an engaging title for your blog..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-2xl transition-all duration-300 text-lg"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Tag Input */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <label className="flex items-center gap-3 text-xl font-semibold text-white">
                    <FiTag className="text-pink-400 text-2xl" />
                    Category / Tag
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. Programming, Health, Design, Technology..."
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-2xl transition-all duration-300 text-lg"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-pink-400 rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Author Info */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <label className="flex items-center gap-3 text-xl font-semibold text-white">
                    <FiUser className="text-blue-400 text-2xl" />
                    Author
                  </label>
                  <div className="px-6 py-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
                    <span className="text-gray-300 text-lg">
                      {user?.name || 'Anonymous'}
                    </span>
                  </div>
                </motion.div>

                {/* Content Editor */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <label className="flex items-center gap-3 text-xl font-semibold text-white">
                    <FiEdit3 className="text-green-400 text-2xl" />
                    Blog Content
                  </label>
                  <div className="relative">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        className="bg-transparent"
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ color: [] }, { background: [] }],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['blockquote', 'code-block'],
                            ['link', 'image'],
                            ['clean'],
                          ],
                        }}
                        formats={[
                          'header', 'bold', 'italic', 'underline', 'strike',
                          'color', 'background', 'list', 'bullet',
                          'blockquote', 'code-block', 'link', 'image'
                        ]}
                        style={{
                          color: 'white',
                          fontSize: '16px',
                          lineHeight: '1.6'
                        }}
                      />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="absolute right-4 top-4 w-2 h-2 bg-green-400 rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  variants={itemVariants}
                  className="flex justify-center flex-wrap gap-6 pt-8"
                >
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={goToAllBlogs}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full text-white font-semibold text-lg shadow-2xl overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                      View All Blogs
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handlePost}
                    disabled={isSubmitting}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full text-white font-semibold text-lg shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <FiSend className="group-hover:translate-x-1 transition-transform" />
                      )}
                      {isSubmitting ? 'Publishing...' : 'Publish Blog'}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Character Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8 text-gray-400"
          >
            <p>Share your story with the world! ✨</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
