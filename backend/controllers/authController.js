// controllers/authController.js

import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// ✅ Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an email address' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No user found with this email address' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and expiry (1 hour)
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Email content
    const message = `
      You requested a password reset for your SkillVerse account.
      
      Please click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      The SkillVerse Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - SkillVerse',
        message,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process forgot password request', 
      error: err.message 
    });
  }
};

// ✅ Validate Reset Token
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token is required' 
      });
    }

    // Hash the token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reset token is valid',
    });
  } catch (err) {
    console.error('Validate reset token error:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to validate reset token', 
      error: err.message 
    });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token and new password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Hash the token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Set the new password directly. The pre-save hook will handle the hashing.
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password', 
      error: err.message 
    });
  }
};

// ✅ Register User
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create user - The pre-save hook in the User model will hash the password
    const user = await User.create({
      name,
      email,
      password, // Pass the plain password to the model
      isEmailVerified: false, 
    });

    // Generate token
    const authToken = generateToken(user._id);

    // Set last login
    user.lastLogin = new Date();
    await user.save();
    
    // Send login notification email (non-blocking)
    try {
      await sendEmail({
        email: user.email,
        subject: 'Successful Login to SkillVerse',
        message: `Hello ${user.name},\n\nThis is a notification to confirm that you have successfully logged into your SkillVerse account just now.\n\nIf this was not you, please secure your account immediately by resetting your password.\n\nBest regards,\nThe SkillVerse Team`,
      });
    } catch (emailError) {
      console.error('Failed to send login notification email:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: err.message 
    });
  }
};

// ✅ Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 2. Find the user and explicitly select the password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Compare the provided password with the stored hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. If password is valid, generate a JWT
    const authToken = generateToken(user._id);
    
    // --- Side effects like logging and emails can be added back here later ---
    // For now, focus on core functionality.
    user.lastLogin = new Date();
    await user.save(); // This is safe now due to the hook fix.

    // 5. Return the token and user info
    return res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ✅ Google OAuth Login Handler
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Google token is required' });

    let payload;

    if (token.split('.').length === 3) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      const { data } = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      payload = {
        sub: data.sub,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isEmailVerified: true,
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      user.avatar = picture;
    }

    user.lastLogin = new Date();
    await user.save();

    const authToken = generateToken(user._id);

    // Send login notification email (non-blocking)
    try {
      await sendEmail({
        email: user.email,
        subject: 'Successful Login to SkillVerse',
        message: `Hello ${user.name},\n\nThis is a notification to confirm that you have successfully logged into your SkillVerse account via Google.\n\nIf this was not you, please secure your account immediately.\n\nBest regards,\nThe SkillVerse Team`,
      });
    } catch (emailError) {
      console.error('Failed to send login notification email:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    return res.status(500).json({ success: false, message: 'Google login failed' });
  }
};

// ✅ Get Logged In User
// ✅ Get Logged In User (Enhanced with payoutDetails)
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        payoutDetails: user.payoutDetails || {}, // 👈 send bank + upi data
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user info', error: err.message });
  }
};

