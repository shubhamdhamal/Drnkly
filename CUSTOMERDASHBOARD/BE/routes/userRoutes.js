const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');

router.get('/:id', getProfile); // GET profile
router.put('/:id', updateProfile); // UPDATE profile

module.exports = router;