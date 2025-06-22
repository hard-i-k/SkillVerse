import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGithub, FiLinkedin, FiLink, FiAward, FiCode } from 'react-icons/fi';
import { Button } from './ui/button';

const ProfileModal = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 50, scale: 0.9 }}
            className="bg-gradient-to-br from-[#232336] to-[#18181b] rounded-2xl w-full max-w-2xl p-8 shadow-2xl border border-white/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button onClick={onClose} variant="ghost" className="absolute top-4 right-4 !p-2 h-auto"><FiX /></Button>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full border-4 border-purple-400 shadow-lg" />
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <div className="flex justify-center md:justify-start gap-4 mt-3">
                  <a href={user.profileLinks?.github} className="text-gray-400 hover:text-white"><FiGithub size={22}/></a>
                  <a href={user.profileLinks?.linkedin} className="text-gray-400 hover:text-white"><FiLinkedin size={22}/></a>
                  <a href={user.profileLinks?.leetcode} className="text-gray-400 hover:text-white"><FiLink size={22}/></a>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><FiCode className="text-purple-400" /> Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(user.skills || []).length > 0 ? user.skills.map((skill, i) => (
                    <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-sm">{skill}</span>
                  )) : <p className="text-gray-400">No skills listed.</p>}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><FiAward className="text-pink-400" /> Achievements</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {(user.achievements || []).length > 0 ? user.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  )) : <p className="text-gray-400">No achievements listed.</p>}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal; 