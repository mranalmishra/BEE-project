const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    avatarUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
