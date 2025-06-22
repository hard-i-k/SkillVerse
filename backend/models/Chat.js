import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // 2 users
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema); 