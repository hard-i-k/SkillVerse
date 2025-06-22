import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listUsers,
  getOrStartChat,
  sendMessage,
  getUserChats,
  getChatMessages,
  markMessagesRead
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/users', protect, listUsers);
router.post('/chat', protect, getOrStartChat);
router.get('/chats', protect, getUserChats);
router.get('/chats/:chatId/messages', protect, getChatMessages);
router.post('/chats/:chatId/messages', protect, sendMessage);
router.post('/chats/:chatId/read', protect, markMessagesRead);

export default router; 