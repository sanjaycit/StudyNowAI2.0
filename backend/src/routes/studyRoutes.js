const express = require('express');
const router = express.Router();
const { getStudySchedule, getFullSchedule } = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/study/schedule
// @desc    Get AI-generated study schedule
// @access  Private
router.route('/schedule').get(protect, getStudySchedule);

// @route   GET /api/study/schedule/full
// @desc    Get full upcoming schedule
// @access  Private
router.route('/schedule/full').get(protect, getFullSchedule);

module.exports = router;
