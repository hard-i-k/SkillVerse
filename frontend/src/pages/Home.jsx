import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowDown, FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1e1e2f] via-[#2c2c4a] to-[#1e1e2f] text-white overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 pt-24 pb-16 max-w-5xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-8"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Launch Your Journey with SkillVerse 🚀
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Empowering learners, creators, and collaborators worldwide.
          </motion.p>
        </motion.div>

        {/* Feature Cards - 2x2 Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-6 max-w-4xl mx-auto mt-10 z-10"
        >
          {[
            { title: 'Create Course', emoji: '🎓', desc: 'Become an instructor and share your expertise.', link: '/create/course' },
            { title: 'Learn', emoji: '📖', desc: 'Browse courses curated by industry experts.', link: '/courses' },
            { title: 'Write Blogs', emoji: '✍️', desc: 'Express your knowledge and ideas with others.', link: '/blogform' },
            { title: 'Find Teammates', emoji: '🤝', desc: 'Connect with like-minded individuals for projects.', link: '/find-teammates' }
          ].map((item, i) => (
            <motion.a 
              key={i} 
              href={item.link} 
              whileHover={{ scale: 1.05 }}
              className="group bg-white/10 backdrop-blur-lg text-white p-8 rounded-xl shadow-lg border border-white/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-4xl opacity-30 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">{item.emoji}</span>
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: '10K+ Hackathons', emoji: '🏆' },
              { title: '500+ Users', emoji: '👥' },
              { title: '1000+ Courses', emoji: '🎓' },
              { title: '5000+ Blogs', emoji: '📝' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20"
              >
                <motion.h4 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.2
                  }}
                  className="text-2xl font-bold mb-2 flex items-center justify-center gap-3"
                >
                  <span className="text-3xl">{stat.emoji}</span>
                  <span>{stat.title}</span>
                </motion.h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Description Cards - Infinite Scroll */}
      <div className="relative z-10 py-20">
        <div 
          className="w-full inline-flex flex-nowrap overflow-hidden"
          style={{ 
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
          }}
        >
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll">
            {[
              { title: 'Interactive Learning', emoji: '📚', desc: 'Courses with practical real-world projects and hands-on experience.' },
              { title: 'Creative Expression', emoji: '✍️', desc: 'Share your knowledge through blogs and connect with the community.' },
              { title: 'Collaborative Projects', emoji: '🤝', desc: 'Find and work with like-minded individuals on exciting projects.' },
              { title: 'Teach & Share', emoji: '🎓', desc: 'Create and manage your own courses to share your expertise.' }
            ].map((f, idx) => (
              <li key={idx} className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white/20 w-80 flex-shrink-0">
                <h5 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-3xl">{f.emoji}</span>
                  {f.title}
                </h5>
                <p className="text-gray-300 text-sm leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ul>
          {/* Duplicated for infinite scroll effect */}
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll" aria-hidden="true">
            {[
              { title: 'Interactive Learning', emoji: '📚', desc: 'Courses with practical real-world projects and hands-on experience.' },
              { title: 'Creative Expression', emoji: '✍️', desc: 'Share your knowledge through blogs and connect with the community.' },
              { title: 'Collaborative Projects', emoji: '🤝', desc: 'Find and work with like-minded individuals on exciting projects.' },
              { title: 'Teach & Share', emoji: '🎓', desc: 'Create and manage your own courses to share your expertise.' }
            ].map((f, idx) => (
              <li key={`dup-${idx}`} className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-white/20 w-80 flex-shrink-0">
                <h5 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-3xl">{f.emoji}</span>
                  {f.title}
                </h5>
                <p className="text-gray-300 text-sm leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scroll Down Icon */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 text-white/60"
      >
        <FiArrowDown size={28} />
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 text-white pt-20 pb-8 mt-20 border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">SkillVerse</h3>
              <p className="text-gray-400 text-sm">Empowering learners and creators worldwide with quality education and collaboration opportunities.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
                <li><Link to="/blogs" className="hover:text-white transition-colors">Blogs</Link></li>
                <li><Link to="/hackathons" className="hover:text-white transition-colors">Hackathons</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="https://github.com/hard-i-k" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FiGithub size={20} />
                </a>
                <a href="https://x.com/hard_ik_8" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FiTwitter size={20} />
                </a>
                <a href="https://www.linkedin.com/in/hardik-kannojia-95b31629b/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FiLinkedin size={20} />
                </a>
                <a href="https://www.instagram.com/hard_ik_8/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FiInstagram size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400 border-t border-white/10 pt-8">
            <p>&copy; {new Date().getFullYear()} SkillVerse. All rights reserved.</p>
            <p className="mt-2">Crafted with ❤️ by Hardik.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;