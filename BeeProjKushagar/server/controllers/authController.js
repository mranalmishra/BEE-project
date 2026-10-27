const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../services/store');
const { getIsConnected } = require('../config/db');
const User = require('../models/User');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'mern_notes_jwt_secret_key_super_secure_2026';
  const expiry = process.env.JWT_EXPIRY || '7d';
  return jwt.sign({ id }, secret, { expiresIn: expiry });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    let existingUser;
    if (getIsConnected()) {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } else {
      existingUser = await store.findUserByEmail(email);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser;
    if (getIsConnected()) {
      newUser = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        avatarUrl: avatarUrl || ''
      });
    } else {
      newUser = await store.createUser({
        name,
        email,
        passwordHash,
        avatarUrl
      });
    }

    const token = generateToken(newUser._id || newUser.id);

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl || '',
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    let user;
    if (getIsConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = await store.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id || user.id);

    res.json({
      success: true,
      data: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
