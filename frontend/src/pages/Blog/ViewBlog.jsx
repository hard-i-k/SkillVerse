import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllBlogs, voteBlog } from '../../utils/api';
import { FiThumbsUp, FiThumbsDown, FiArrowLeft, FiUser, FiTag, FiClock, FiShare2, FiBookmark } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ViewBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await getAllBlogs();
        const single = res.data.find((b) => b._id === id);
        setBlog(single);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load previous vote (if stored in localStorage for simplicity)
    const prevVote = localStorage.getItem(`vote_${id}`);
    if (prevVote) setUserVote(prevVote);

    fetchBlog();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleVote = async (type) => {
    if (!blog || !['up', 'down'].includes(type)) return;
  
    try {
      const prevVote = userVote;
      const isSameVote = prevVote === type;
  
      const res = await voteBlog(blog._id, type);
      const { upvotes, downvotes } = res.data;
  
      if (isSameVote) {
        // User clicked same vote again -> remove vote
        localStorage.removeItem(`vote_${id}`);
        setUserVote(null);
      } else {
        // New vote or changed vote
        localStorage.setItem(`vote_${id}`, type);
        setUserVote(type);
      }
  
      setBlog({ ...blog, upvotes, downvotes });
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };
  

  const shareBlog = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: `Check out this amazing blog: ${blog.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-pink-500 rounded-full"
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-2xl font-bold text-white mb-2">Blog not found</h3>
          <p className="text-gray-400 mb-6">The blog you're looking for doesn't exist.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/blogs')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold"
          >
            Back to Blogs
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 z-50"
        style={{ width: `${readingProgress}%` }}
        transition={{ duration: 0.1 }}
      />

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
      </div>

      <div className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/blogs')}
              className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
            >
              <FiArrowLeft />
              Back to Blogs
            </motion.button>
          </motion.div>

          {/* Main Blog Container */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                📖
              </motion.div>

              <div className="relative z-10">
                {/* Blog Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-5xl font-bold mb-8 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text leading-tight"
                >
                  {blog.title}
                </motion.h1>

                {/* Meta Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-wrap items-center gap-6 mb-8 p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl"
                >
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiUser className="text-purple-400 text-xl" />
                    <span className="font-medium text-white">{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiTag className="text-pink-400 text-xl" />
                    <span className="font-medium text-pink-400">#{blog.tag}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiClock className="text-blue-400 text-xl" />
                    <span>Just now</span>
                  </div>
                </motion.div>

                {/* Blog Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="prose prose-invert max-w-none text-gray-100 leading-relaxed text-lg mb-10"
                  style={{
                    '--tw-prose-body': '#d1d5db',
                    '--tw-prose-headings': '#ffffff',
                    '--tw-prose-links': '#a855f7',
                    '--tw-prose-bold': '#ffffff',
                    '--tw-prose-counters': '#6b7280',
                    '--tw-prose-bullets': '#6b7280',
                    '--tw-prose-hr': '#374151',
                    '--tw-prose-quotes': '#f3f4f6',
                    '--tw-prose-quote-borders': '#e5e7eb',
                    '--tw-prose-captions': '#9ca3af',
                    '--tw-prose-code': '#ffffff',
                    '--tw-prose-pre-code': '#e5e7eb',
                    '--tw-prose-pre-bg': '#1f2937',
                    '--tw-prose-th-borders': '#d1d5db',
                    '--tw-prose-td-borders': '#374151',
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                </motion.div>

                {/* Action Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-white/10"
                >
                  {/* Voting Buttons */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVote('up')}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300 ${
                        userVote === 'up' 
                          ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                          : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-500/40'
                      }`}
                    >
                      <FiThumbsUp className="text-xl" />
                      <span className="font-semibold text-lg">{blog.upvotes || 0}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVote('down')}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300 ${
                        userVote === 'down' 
                          ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40'
                      }`}
                    >
                      <FiThumbsDown className="text-xl" />
                      <span className="font-semibold text-lg">{blog.downvotes || 0}</span>
                    </motion.button>
                  </div>

                  {/* Share and Bookmark */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={shareBlog}
                      className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <FiShare2 className="text-xl" />
                      Share
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <FiBookmark className="text-xl" />
                      Bookmark
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Related Blogs Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Enjoyed this blog?</h3>
            <p className="text-gray-400 mb-6">Explore more amazing content from our community</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/blogs')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full text-white font-semibold text-lg shadow-2xl"
            >
              Discover More Blogs
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ViewBlog;
