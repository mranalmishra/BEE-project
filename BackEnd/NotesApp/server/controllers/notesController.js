const store = require('../services/store');
const { getIsConnected } = require('../config/db');
const Note = require('../models/Note');

// @desc    Get all notes for logged-in user (filtered by search, tag, archived, deleted)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { search, tag, archived, deleted } = req.query;

    const isDeleted  = deleted  !== undefined ? deleted  === 'true' : false;
    const isArchived = archived !== undefined ? archived === 'true' : false;

    if (getIsConnected()) {
      let filter = { userId, isDeleted };

      // Only apply isArchived filter when not fetching trash
      if (!isDeleted) {
        filter.isArchived = isArchived;
      }

      if (tag) {
        filter.tags = { $regex: new RegExp(`^${tag}$`, 'i') };
      }

      if (search && search.trim()) {
        const query = search.trim();
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ];
      }

      const notes = await Note.find(filter)
        .sort({ isPinned: -1, updatedAt: -1 });

      return res.json({
        success: true,
        count: notes.length,
        data: notes
      });
    } else {
      // Local zero-config store
      const notes = await store.getNotes({
        userId,
        search,
        tag,
        isArchived,
        isDeleted
      });

      return res.json({
        success: true,
        count: notes.length,
        data: notes
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note by ID (user-isolated)
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    let note;
    if (getIsConnected()) {
      note = await Note.findOne({ _id: id, userId });
    } else {
      note = await store.getNoteById(id, userId);
    }

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, content, tags, color, isPinned } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required'
      });
    }

    let note;
    if (getIsConnected()) {
      note = await Note.create({
        userId,
        title: title.trim(),
        content: content || '',
        tags: Array.isArray(tags) ? tags : [],
        color: color || '#ffffff',
        isPinned: Boolean(isPinned),
        isArchived: false,
        isDeleted: false
      });
    } else {
      note = await store.createNote({
        userId,
        title: title.trim(),
        content: content || '',
        tags: Array.isArray(tags) ? tags : [],
        color: color || '#ffffff',
        isPinned: Boolean(isPinned)
      });
    }

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { title, content, tags, color, isPinned, isArchived, isDeleted } = req.body;

    let updatedNote;
    if (getIsConnected()) {
      const existing = await Note.findOne({ _id: id, userId });
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }

      if (title !== undefined) existing.title = title.trim();
      if (content !== undefined) existing.content = content;
      if (tags !== undefined) existing.tags = tags;
      if (color !== undefined) existing.color = color;
      if (isPinned !== undefined) existing.isPinned = isPinned;
      if (isArchived !== undefined) existing.isArchived = isArchived;
      if (isDeleted !== undefined) existing.isDeleted = isDeleted;

      updatedNote = await existing.save();
    } else {
      updatedNote = await store.updateNote(id, userId, {
        title,
        content,
        tags,
        color,
        isPinned,
        isArchived,
        isDeleted
      });

      if (!updatedNote) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }
    }

    res.json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note (soft delete to trash, or permanent if ?permanent=true)
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const isPermanent = req.query.permanent === 'true';

    if (getIsConnected()) {
      const note = await Note.findOne({ _id: id, userId });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }

      if (isPermanent) {
        await Note.deleteOne({ _id: id, userId });
        return res.json({
          success: true,
          message: 'Note permanently deleted',
          data: { id }
        });
      } else {
        note.isDeleted = true;
        await note.save();
        return res.json({
          success: true,
          message: 'Note moved to trash',
          data: note
        });
      }
    } else {
      const result = await store.deleteNote(id, userId, isPermanent);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }

      return res.json({
        success: true,
        message: isPermanent ? 'Note permanently deleted' : 'Note moved to trash',
        data: result
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePinNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (getIsConnected()) {
      const note = await Note.findOne({ _id: id, userId });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }
      note.isPinned = !note.isPinned;
      await note.save();
      return res.json({ success: true, data: note });
    } else {
      const note = await store.getNoteById(id, userId);
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }
      const updated = await store.updateNote(id, userId, { isPinned: !note.isPinned });
      return res.json({ success: true, data: updated });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle archive status
// @route   PATCH /api/notes/:id/archive
// @access  Private
const toggleArchiveNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (getIsConnected()) {
      const note = await Note.findOne({ _id: id, userId });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }
      note.isArchived = !note.isArchived;
      if (note.isArchived) note.isPinned = false; // unpin when archived
      await note.save();
      return res.json({ success: true, data: note });
    } else {
      const note = await store.getNoteById(id, userId);
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }
      const willArchive = !note.isArchived;
      const updated = await store.updateNote(id, userId, {
        isArchived: willArchive,
        isPinned: willArchive ? false : note.isPinned
      });
      return res.json({ success: true, data: updated });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Restore note from trash
// @route   PATCH /api/notes/:id/restore
// @access  Private
const restoreNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (getIsConnected()) {
      const note = await Note.findOne({ _id: id, userId });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }
      note.isDeleted = false;
      await note.save();
      return res.json({ success: true, data: note });
    } else {
      const updated = await store.updateNote(id, userId, { isDeleted: false });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or access denied'
        });
      }
      return res.json({ success: true, data: updated });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleArchiveNote,
  restoreNote
};
