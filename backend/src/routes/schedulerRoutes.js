const express = require('express');
const router = express.Router();
const { optimizeSchedule } = require('../controllers/schedulerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/optimize', protect, optimizeSchedule);

module.exports = router;
