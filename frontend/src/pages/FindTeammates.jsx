import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listUsers } from '../utils/api';
import UserCard from '../components/UserCard';
import { FiSearch } from 'react-icons/fi';

const FindTeammates = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await listUsers(search);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#232336] to-[#18181b] text-white p-0 m-0">
      <div className="max-w-7xl mx-auto py-16 px-4">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Find Teammates</h1>
          <p className="text-lg text-gray-300">Connect with talented individuals based on their skills and achievements.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mb-10 relative max-w-lg mx-auto">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by skill, achievement, or name..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-xl border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>
        
        <motion.div layout className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {loading ? (
              <p>Loading...</p>
            ) : (
              users.map(user => <UserCard key={user._id} user={user} />)
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default FindTeammates; 