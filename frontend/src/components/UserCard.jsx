import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import ProfileModal from './ProfileModal';
import { useNavigate, Link } from 'react-router-dom';
import { getOrStartChat } from '../utils/api';
import { toast } from 'react-hot-toast';

const UserCard = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const navigate = useNavigate();

  const handleChat = async () => {
    setIsChatLoading(true);
    try {
      const { data: chat } = await getOrStartChat(user._id);
      toast.success(`Chat started with ${user.name}!`);
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        layout
        className="bg-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center border border-white/20"
      >
        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-purple-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">{user.name}</h3>
        <div className="flex-grow w-full mb-4">
          <p className="text-sm text-gray-300 font-semibold mb-1">Skills:</p>
          <p className="text-sm text-gray-400 h-10 overflow-hidden">{(user.skills || []).join(', ') || 'No skills listed'}</p>
        </div>
        <div className="w-full flex flex-col gap-3">
          <Link to={`/profile/${user._id}`}>
            <Button variant="outline" className="w-full">View Full Profile</Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">Quick View</Button>
          <Button 
            onClick={handleChat} 
            variant="primary" 
            disabled={isChatLoading}
            className="flex items-center justify-center gap-2"
          >
            {isChatLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Starting Chat...
              </>
            ) : (
              'Chat'
            )}
          </Button>
        </div>
      </motion.div>
      <ProfileModal user={user} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default UserCard; 