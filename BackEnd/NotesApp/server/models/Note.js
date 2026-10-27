const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    color: {
      type: String,
      default: '#ffffff'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
