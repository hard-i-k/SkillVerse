import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserChats, getChatMessages, sendMessage } from '../utils/api';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import { toast } from 'react-hot-toast';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      try {
        const { data } = await getUserChats();
        setChats(data);
        
        // If a specific chatId is provided, find and select it
        if (chatId) {
          const current = data.find(c => c._id === chatId);
          if (current) {
            setSelectedChat(current);
          } else {
            toast.error('Chat not found');
            navigate('/chat');
          }
        } else if (data.length > 0) {
          // If no chatId but chats exist, select the first one
          setSelectedChat(data[0]);
          navigate(`/chat/${data[0]._id}`);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, [chatId, navigate]);

  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await getChatMessages(selectedChat._id);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  const handleSendMessage = async (content) => {
    if (!selectedChat) return;
    try {
      const { data: newMessage } = await sendMessage(selectedChat._id, content);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    navigate(`/chat/${chat._id}`);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#18181b] to-[#232336] text-white flex overflow-hidden">
      <ChatSidebar 
        chats={chats} 
        selectedChat={selectedChat} 
        setSelectedChat={handleChatSelect} 
        loading={loadingChats} 
      />
      <ChatWindow
        chat={selectedChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loadingMessages}
      />
    </div>
  );
};

export default Chat; 