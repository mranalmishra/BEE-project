const jwt = require('jsonwebtoken');
const store = require('../services/store');
const { getIsConnected } = require('../config/db');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'mern_notes_jwt_secret_key_super_secure_2026';
    const decoded = jwt.verify(token, secret);

    let user;
    if (getIsConnected()) {
      user = await User.findById(decoded.id).select('-passwordHash');
    } else {
      user = await store.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User no longer exists'
      });
    }

    // Attach user to request object (userId for note queries)
    req.user = {
      _id: user._id || user.id,
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || ''
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token failed verification or has expired'
    });
  }
};

module.exports = { protect };
