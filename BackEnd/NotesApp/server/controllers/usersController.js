const bcrypt = require('bcryptjs');
const store = require('../services/store');
const { getIsConnected } = require('../config/db');
const User = require('../models/User');

// @desc    Update user profile (name, avatarUrl)
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, avatarUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty'
      });
    }

    let updatedUser;
    if (getIsConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.name = name.trim();
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      await user.save();
      updatedUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      };
    } else {
      const user = await store.updateUser(userId, {
        name: name.trim(),
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined
      });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      updatedUser = {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      };
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/me/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    let user;
    if (getIsConnected()) {
      user = await User.findById(userId);
    } else {
      user = await store.findUserById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    if (getIsConnected()) {
      user.passwordHash = newPasswordHash;
      await user.save();
    } else {
      await store.updateUser(userId, { passwordHash: newPasswordHash });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword
};
