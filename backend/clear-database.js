import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Blog from './models/Blog.js';
import connectDB from './config/db.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('MongoDB Connected...');

    // Clear Courses
    const courseResult = await Course.deleteMany({});
    console.log(`${courseResult.deletedCount} courses have been deleted.`);

    // Clear Blogs
    const blogResult = await Blog.deleteMany({});
    console.log(`${blogResult.deletedCount} blogs have been deleted.`);

    console.log('Database has been cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error clearing database: ${error.message}`);
    process.exit(1);
  }
};

clearDatabase(); 