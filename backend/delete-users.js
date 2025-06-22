import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const deleteUsers = async () => {
  try {
    await connectDB();
    const result = await User.deleteMany({ name: { $in: ['geek', 'geeksy'] } });
    console.log(`${result.deletedCount} users deleted.`);
    process.exit(0);
  } catch (err) {
    console.error('Error deleting users:', err);
    process.exit(1);
  }
};

deleteUsers(); 