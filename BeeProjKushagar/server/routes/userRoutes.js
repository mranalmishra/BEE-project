const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/usersController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.put('/me', updateProfile);
router.put('/me/password', changePassword);

module.exports = router;
