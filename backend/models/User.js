import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },

  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },

  googleId: {
    type: String,
    index: true,
    sparse: true,
  },

  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1699999999/default-avatar.png',
  },

  role: {
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user',
  },

  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },

  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  savedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],

  completedChapters: {
    type: Map,
    of: [String],
    default: {},
  },

  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,

  resetPasswordToken: String,
  resetPasswordExpires: Date,

  lastLogin: Date,
  loginHistory: [
    {
      timestamp: Date,
      ip: String,
      userAgent: String,
    },
  ],

  payoutDetails: {
    upiId: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
  },

  skills: [{ type: String, trim: true }],
  achievements: [{ type: String, trim: true }],
  profileLinks: {
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    leetcode: { type: String, trim: true },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLoginInfo = async function (ip, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({ timestamp: new Date(), ip, userAgent });
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
