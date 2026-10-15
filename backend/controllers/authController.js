const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile name
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, warnThreshold, dangerThreshold } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be between 2 and 50 characters.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.name = name.trim();
    if (typeof warnThreshold === 'number' && warnThreshold >= 1 && warnThreshold <= 100) {
      user.warnThreshold = warnThreshold;
    }
    if (typeof dangerThreshold === 'number' && dangerThreshold >= 1 && dangerThreshold <= 100) {
      user.dangerThreshold = dangerThreshold;
    }

    await user.save();

    try {
      require('../services/notificationService').triggerNotificationSync(req.user._id);
    } catch (e) {}

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        warnThreshold: user.warnThreshold,
        dangerThreshold: user.dangerThreshold,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating profile.' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must differ from current password.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating password.' });
  }
};

// @desc    Permanently delete user account and all owned data
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    // 1. Validation
    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete your account.',
      });
    }

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Please type DELETE exactly to confirm account deletion.',
      });
    }

    // 2. Load user with password hash
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password.',
      });
    }

    // 4. Atomic delete of all user-owned data in one Mongoose transaction if available
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (sessionErr) {
      // Standalone MongoDB without replica set fallback
      session = null;
    }

    try {
      if (session) {
        await Transaction.deleteMany({ userId: req.user._id }).session(session);
        await Budget.deleteMany({ userId: req.user._id }).session(session);
        await Notification.deleteMany({ userId: req.user._id }).session(session);
        await User.findByIdAndDelete(req.user._id).session(session);
        await session.commitTransaction();
      } else {
        await Transaction.deleteMany({ userId: req.user._id });
        await Budget.deleteMany({ userId: req.user._id });
        await Notification.deleteMany({ userId: req.user._id });
        await User.findByIdAndDelete(req.user._id);
      }
    } catch (deleteError) {
      if (session) {
        await session.abortTransaction();
      }
      throw deleteError;
    } finally {
      if (session) {
        session.endSession();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Your account and all data were permanently deleted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during account deletion.',
    });
  }
};

module.exports = { register, login, getMe, updateProfile, updatePassword, deleteAccount };
