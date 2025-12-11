const { getStudySchedule: getSchedule, getFullSchedule: getFull } = require('../services/studyService');

// @desc    Get AI-generated study schedule for logged-in user
// @route   GET /api/study/schedule
// @access  Private
const getStudySchedule = async (req, res) => {
    try {
        const schedule = await getSchedule(req.user.id);

        if (!schedule || schedule.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(schedule);
    } catch (error) {
        console.error('Error fetching study schedule:', error.message);
        res.status(500).json({ message: 'Failed to fetch study schedule' });
    }
};

// @desc    Get full upcoming schedule grouped by date
// @route   GET /api/study/schedule/full
// @access  Private
const getFullSchedule = async (req, res) => {
    try {
        const scheduleMap = await getFull(req.user.id);
        res.status(200).json(scheduleMap);
    } catch (error) {
        console.error('Error fetching full schedule:', error.message);
        res.status(500).json({ message: 'Failed to fetch full schedule' });
    }
};

module.exports = {
    getStudySchedule,
    getFullSchedule
};
