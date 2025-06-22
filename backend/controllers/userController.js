import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Course from '../models/Course.js';
import Blog from '../models/Blog.js';
import cloudinary from '../utils/cloudinary.js';

// 🔍 Get current user info (used to pre-fill payout fields)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email payoutDetails');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user', error: err.message });
  }
};

// 👤 Get user profile by ID (public)
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting profile for userId:', userId);
    
    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }
    
    const user = await User.findById(userId)
      .select('name email avatar skills achievements profileLinks enrolledCourses')
      .lean();
    
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's created courses
    const createdCourses = await Course.find({ creator: userId })
      .select('title description price isPaid chapters')
      .lean();

    // Get user's enrolled courses - use the enrolledCourses array from user
    const enrolledCourses = await Course.find({ 
      _id: { $in: user.enrolledCourses || [] } 
    })
      .select('title description price isPaid chapters')
      .lean();

    console.log('Sending profile data:', {
      user: user.name,
      createdCourses: createdCourses.length,
      enrolledCourses: enrolledCourses.length
    });

    res.status(200).json({
      user,
      createdCourses,
      enrolledCourses
    });
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    res.status(500).json({ message: 'Failed to fetch user profile', error: err.message });
  }
};

// 🏦 Update user's payout details (UPI OR Bank Info)
export const updatePayoutDetails = async (req, res) => {
  try {
    const { upiId, bankName, accountNumber, ifscCode } = req.body;

    if (!upiId && (!bankName || !accountNumber || !ifscCode)) {
      return res.status(400).json({ message: 'Provide either UPI or full bank details' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        payoutDetails: {
          upiId: upiId || undefined,
          bankName: bankName || undefined,
          accountNumber: accountNumber || undefined,
          ifscCode: ifscCode || undefined
        }
      },
      { new: true }
    ).select('payoutDetails');

    res.status(200).json({ message: 'Payout details updated', payoutDetails: user.payoutDetails });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payout details', error: err.message });
  }
};

// Get user dashboard data
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('createdCourses', 'title price earnings')
      .populate('enrolledCourses', 'title chapters');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate total earnings
    const totalEarnings = (user.createdCourses || []).reduce((sum, c) => sum + (c.earnings || 0), 0);

    // Progress for enrolled courses
    const progress = (user.enrolledCourses || []).map(course => {
      const completed = (user.completedChapters?.get(course._id.toString()) || []).length;
      const total = course.chapters?.length || 0;
      return {
        courseId: course._id,
        title: course.title,
        completed,
        total,
        percent: total ? Math.round((completed / total) * 100) : 0,
      };
    });

    // Fetch user's blogs
    const createdBlogs = await Blog.find({ authorId: req.user._id })
      .select('title tag upvotes downvotes createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user's chats for the inbox
    const inboxChats = await Chat.find({ users: req.user._id })
      .populate('users', 'name avatar')
      .populate({ path: 'lastMessage', select: 'content' })
      .sort({ updatedAt: -1 })
      .limit(5); // Get 5 most recent chats

    res.status(200).json({
      profile: {
        _id: user._id, // Add user ID to profile
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        skills: user.skills,
        achievements: user.achievements,
        profileLinks: user.profileLinks,
      },
      createdCourses: user.createdCourses,
      createdBlogs,
      totalEarnings,
      enrolledCourses: user.enrolledCourses,
      progress,
      inbox: inboxChats,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: err.message });
  }
};

// Update user profile (skills, achievements, links)
export const updateProfile = async (req, res) => {
  try {
    const { skills, achievements, profileLinks } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (skills) user.skills = skills;
    if (achievements) user.achievements = achievements;
    if (profileLinks) user.profileLinks = profileLinks;
    await user.save();
    res.status(200).json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// 📸 Update user avatar
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use a promise to handle the stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          public_id: user._id.toString(),
          overwrite: true,
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    if (!result || !result.secure_url) {
      return res.status(500).json({ message: 'Cloudinary upload failed' });
    }

    user.avatar = result.secure_url;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: 'Avatar updated successfully',
      avatar: user.avatar,
    });
  } catch (err) {
    console.error('Avatar Update Error:', err);
    res.status(500).json({ message: 'Failed to update avatar', error: err.message });
  }
};

// List all users (for teammates search)
export const getAllUsers = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter = {
        $or: [
          { name: regex },
          { skills: { $elemMatch: regex } },
          { achievements: { $elemMatch: regex } },
        ],
      };
    }
    const users = await User.find(filter).select('name email avatar skills achievements profileLinks');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};
