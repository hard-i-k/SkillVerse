import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiUsers } from 'react-icons/fi';

const ChatSidebar = ({ chats, selectedChat, setSelectedChat, loading }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (chat) => {
    setSelectedChat(chat);
    navigate(`/chat/${chat._id}`);
  };

  const handleFindTeammates = () => {
    navigate('/find-teammates');
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-1/3 max-w-sm bg-black/20 border-r border-white/10 flex flex-col"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FiMessageCircle className="text-purple-400" />
          Chats
        </h2>
        <button
          onClick={handleFindTeammates}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
          title="Find new teammates to chat with"
        >
          <FiUsers className="text-white" />
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center">
            <FiMessageCircle className="text-4xl text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No chats yet</h3>
            <p className="text-gray-400 mb-4">Start a conversation with someone!</p>
            <button
              onClick={handleFindTeammates}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Find Teammates
            </button>
          </div>
        ) : (
          chats.map(chat => {
            const otherUser = chat.users.find(u => u._id !== currentUser._id);
            if (!otherUser) return null;
            
            return (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelect(chat)}
                className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedChat?._id === chat._id 
                    ? 'border-purple-400 bg-white/10' 
                    : 'border-transparent hover:bg-white/5'
                }`}
              >
                <img 
                  src={otherUser.avatar} 
                  alt={otherUser.name} 
                  className="w-12 h-12 rounded-full border-2 border-purple-400/30" 
                />
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold truncate">{otherUser.name}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {chat.lastMessage && (
                  <div className="text-xs text-gray-500">
                    {new Date(chat.lastMessage.createdAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default ChatSidebar; 