const express = require('express');
const router = express.Router();
const {
    getTopics,
    getTopic,
    createTopic,
    updateTopic,
    deleteTopic,
    reviewTopic,
    generateTopicRoadmap,
    getStepResources,
    getTopicQuiz,
    submitTopicQuiz,
    getStepQuiz,
    submitStepQuiz
} = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET/POST /api/topics
// @desc    Get all topics or create a new one
// @access  Private
router.route('/')
    .get(protect, getTopics)
    .post(protect, createTopic);

// @route   GET/PUT/DELETE /api/topics/:id
// @desc    Get, update, or delete a specific topic
// @access  Private
router.route('/:id')
    .get(protect, getTopic)
    .put(protect, updateTopic)
    .delete(protect, deleteTopic);

// @route   PUT /api/topics/:id/review
// @desc    Mark a topic as reviewed
// @access  Private
router.route('/:id/review').put(protect, reviewTopic);

// @route   POST /api/topics/:id/roadmap
// @desc    Generate a study roadmap for a topic
// @access  Private
router.route('/:id/roadmap').post(protect, generateTopicRoadmap);
router.route('/:id/resources').post(protect, getStepResources);

// @route   GET/POST /api/topics/:id/quiz
// @desc    Get or submit a quiz for a topic
// @access  Private
router.route('/:id/quiz')
    .get(protect, getTopicQuiz)
    .post(protect, submitTopicQuiz);

// @route   GET/POST /api/topics/:id/roadmap/steps/:stepIndex/quiz
// @desc    Get or submit a quiz for a specific roadmap step
// @access  Private
router.route('/:id/roadmap/steps/:stepIndex/quiz')
    .get(protect, getStepQuiz)
    .post(protect, submitStepQuiz);

module.exports = router;
