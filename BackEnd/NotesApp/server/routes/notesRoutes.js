const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleArchiveNote,
  restoreNote
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// All note routes require authentication and are scoped to the user
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

router.patch('/:id/pin', togglePinNote);
router.patch('/:id/archive', toggleArchiveNote);
router.patch('/:id/restore', restoreNote);

module.exports = router;
