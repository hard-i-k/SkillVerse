import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// List all users (with search by skill/achievement)
export const listUsers = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const regex = new RegExp(q, 'i');
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { skills: regex },
        { achievements: regex },
        { name: regex },
      ],
    }).select('name avatar skills achievements profileLinks');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list users', error: err.message });
  }
};

// Get or start a chat between two users
export const getOrStartChat = async (req, res) => {
  try {
    const { userId } = req.body;
    let chat = await Chat.findOne({ users: { $all: [req.user._id, userId] } })
      .populate('users', 'name avatar')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } });
    
    if (!chat) {
      // Create new chat
      chat = await Chat.create({ users: [req.user._id, userId], messages: [] });
      // Populate the newly created chat
      chat = await Chat.findById(chat._id)
        .populate('users', 'name avatar')
        .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } });
    }
    
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get/start chat', error: err.message });
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const message = await Message.create({ chat: chatId, sender: req.user._id, content });
    chat.messages.push(message._id);
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate('users', 'name avatar')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
      .sort('-updatedAt');
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats', error: err.message });
  }
};

// Get all messages in a chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const messages = await Message.find({ chat: chatId }).populate('sender', 'name avatar').sort('createdAt');
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

// Mark all messages as read in a chat
export const markMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await Message.updateMany({ chat: chatId, sender: { $ne: req.user._id } }, { read: true });
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark messages as read', error: err.message });
  }
}; 