import React, { useEffect, useState } from 'react';
import { getAllBlogs, voteBlog, deleteBlog } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { FiThumbsUp, FiThumbsDown, FiSearch, FiClock, FiUser, FiTag, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';


const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getAllBlogs();
        setBlogs(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filteredBlogs = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(lower) ||
        blog.author.toLowerCase().includes(lower) ||
        blog.tag.toLowerCase().includes(lower)
    );
    setFiltered(filteredBlogs);
  }, [search, blogs]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      setFiltered((prev) => prev.filter((b) => b._id !== id));
    } catch (error) {
      alert('Failed to delete blog.');
    }
  };

  const handleVote = async (id, type) => {
    try {
      const res = await voteBlog(id, type === 'up' ? 'upvote' : 'downvote');
      const { upvotes, downvotes } = res.data;
      setBlogs((prev) => prev.map((b) => b._id === id ? { ...b, upvotes, downvotes } : b));
      setFiltered((prev) => prev.map((b) => b._id === id ? { ...b, upvotes, downvotes } : b));
    } catch (error) {
      alert('Failed to vote.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      rotateY: 2,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
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

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
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

      <div className="relative z-10 p-0 m-0 w-full h-full">
        <div className="w-full p-0 m-0">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              ✨ Explore Blogs
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Discover amazing stories, insights, and knowledge from our community of creators
            </p>
          </motion.div>

          {/* Create Blog Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/blogform')}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full text-white font-semibold text-lg shadow-2xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ✨
                </motion.span>
                Create Your Own Blog
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6 flex items-center justify-center relative max-w-2xl mx-auto"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by title, author, or tag..."
                className="w-full px-6 py-4 pl-12 pr-12 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full"
              />
            </div>
          </motion.div>

          {/* Blog Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filtered.map((blog, i) => (
                <motion.div
                  key={blog._id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="group relative cursor-pointer"
                  onClick={() => navigate(`/blogs/${blog._id}`)}
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Main Card */}
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden">
                    {/* Animated Border */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Title */}
                      <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
                        {blog.title}
                      </h2>
                      
                      {/* Meta Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-gray-300">
                          <FiUser className="text-purple-400" />
                          <span className="font-medium">{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <FiTag className="text-pink-400" />
                          <span className="font-medium">#{blog.tag}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <FiClock className="text-blue-400" />
                          <span>Just now</span>
                        </div>
                      </div>

                      {/* Voting Section */}
                      <div className="flex gap-4 pt-4 border-t border-white/10 items-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(blog._id, 'up');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-500/40 transition-all duration-300"
                        >
                          <FiThumbsUp className="text-lg" />
                          <span className="font-semibold">{blog.upvotes || 0}</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(blog._id, 'down');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300"
                        >
                          <FiThumbsDown className="text-lg" />
                          <span className="font-semibold">{blog.downvotes || 0}</span>
                        </motion.button>
                        {/* Delete button only for creator */}
                        {user && blog.authorId === user._id && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(blog._id);
                            }}
                            className="ml-2 px-4 py-2 rounded-full bg-red-600/80 text-white font-semibold hover:bg-red-700 transition-all duration-300"
                          >
                            Delete
                          </motion.button>
                        )}
                      </div>

                      {/* Read More Indicator */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-purple-400"
                        >
                          <FiArrowRight className="text-xl" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filtered.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No blogs found</h3>
              <p className="text-gray-400">Try adjusting your search terms or create the first blog!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBlogs;
