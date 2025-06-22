import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { FiSend, FiMessageCircle, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ChatWindow = ({ chat, messages, onSendMessage, loading }) => {
  const [content, setContent] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const otherUser = chat?.users.find(u => u._id !== currentUser._id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };

  const handleFindTeammates = () => {
    navigate('/find-teammates');
  };
  
  if (!chat) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <FiMessageCircle className="text-6xl text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-300 mb-2">No Chat Selected</h2>
          <p className="text-gray-400 mb-6">Choose a chat from the sidebar or start a new conversation</p>
          <button
            onClick={handleFindTeammates}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FiUsers />
            Find Teammates
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-grow flex flex-col"
    >
      <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/20">
        <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full border-2 border-purple-400/30" />
        <div>
          <h2 className="text-xl font-bold">{otherUser.name}</h2>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
              <p className="text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiMessageCircle className="text-4xl text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No messages yet</h3>
              <p className="text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 my-3 ${msg.sender._id === currentUser._id ? 'justify-end' : ''}`}
              >
                {msg.sender._id !== currentUser._id && (
                  <img src={msg.sender.avatar} className="w-8 h-8 rounded-full border border-purple-400/30" />
                )}
                <div className={`px-4 py-2 rounded-2xl max-w-lg ${
                  msg.sender._id === currentUser._id 
                    ? 'bg-purple-600 rounded-br-none' 
                    : 'bg-gray-700 rounded-bl-none'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full pl-4 pr-16 py-3 bg-white/10 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-400"
          />
          <Button 
            type="submit" 
            variant="ghost" 
            disabled={!content.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 !p-2 h-auto text-purple-400 hover:text-white disabled:opacity-50"
          >
            <FiSend size={22} />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatWindow; 