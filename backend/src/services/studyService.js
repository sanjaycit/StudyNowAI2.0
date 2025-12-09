const Topic = require('../models/topicModel');
const Subject = require('../models/subjectModel');

// These are the review intervals (in days) for each difficulty level
const reviewIntervals = {
    easy: [1, 3, 7, 14, 30],
    medium: [1, 2, 5, 10, 21],
    hard: [1, 1, 2, 3, 5],
};

// This function figures out when the next review should be, based on difficulty
const calculateNextReviewDate = (difficulty, lastReviewed, repetitionLevel = 0) => {
    const today = new Date();
    // Get the interval based on the current repetition level
    // If level exceeds array length, use the last value (max interval)
    const intervals = reviewIntervals[difficulty];
    const index = Math.min(repetitionLevel, intervals.length - 1);
    const interval = intervals[index];

    const nextDate = new Date(lastReviewed || today);
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate;
};

// This function gives each topic a score to help decide what to study next
const calculatePriorityScore = (topic, subject, userPreferences) => {
    let score = 0;
    const today = new Date();

    // Give new topics a higher score
    const statusWeight = { new: 5, learning: 3, revised: 1 };
    score += statusWeight[topic.status] || 0;

    // Harder topics get a little extra weight
    const difficultyWeight = { easy: 1, medium: 2, hard: 3 };
    score += difficultyWeight[topic.difficulty] || 2;

    // If the user wants to focus on hard or easy topics, adjust the score
    if (userPreferences?.topicPriorityWeight) {
        switch (userPreferences.topicPriorityWeight) {
            case 'Focus on Hard Topics':
                if (topic.difficulty === 'hard') score += 3;
                else if (topic.difficulty === 'medium') score += 1;
                break;
            case 'Focus on Easy Topics':
                if (topic.difficulty === 'easy') score += 2;
                break;
            case 'Balanced':
            default:
                // Default balanced scoring
                break;
        }
    }

    // If a topic is overdue for review, bump up its score a lot
    if (topic.nextReviewDate && new Date(topic.nextReviewDate) < today) {
        // Overdue topics get a massive priority boost
        const daysOverdue = (today - new Date(topic.nextReviewDate)) / (1000 * 60 * 60 * 24);
        score += 20 + daysOverdue;
    }

    // If the exam is coming up soon, make this topic a higher priority
    if (subject?.examDate) {
        const examDate = new Date(subject.examDate);
        const daysUntilExam = (examDate - today) / (1000 * 60 * 60 * 24);

        if (daysUntilExam > 0) {
            if (daysUntilExam <= 7) score += 15;
            else if (daysUntilExam <= 14) score += 10;
            else if (daysUntilExam <= 30) score += 5;
        }
    } else {
        // If there's no exam date, just give a small boost
        score += 1;
    }

    // Factor 6: Time Since Creation (Older, non-revised topics get a boost)
    if (topic.status !== 'revised') {
        const daysSinceCreation = (today - new Date(topic.createdAt)) / (1000 * 60 * 60 * 24);
        score += daysSinceCreation * 0.1;
    }

    return score;
};

// Update priority scores for all topics of a user
const updatePriorityScores = async (userId) => {
    const topics = await Topic.find({ user: userId });
    const subjects = await Subject.find({ user: userId });
    const User = require('../models/userModel');
    const user = await User.findById(userId);

    const subjectMap = subjects.reduce((map, subject) => {
        map[subject._id] = subject;
        return map;
    }, {});

    for (const topic of topics) {
        const subject = subjectMap[topic.subject];
        if (subject) {
            topic.priorityScore = calculatePriorityScore(topic, subject, user?.preferences);
            await topic.save();
        }
    }
};

// Get the top 10 high-priority topics for the user
const getStudySchedule = async (userId) => {
    await updatePriorityScores(userId);

    // Get user preferences to determine how many topics to return
    const User = require('../models/userModel');
    const user = await User.findById(userId);

    // Calculate target topics based on daily study goal
    let targetTopics = 10; // default
    if (user?.preferences?.dailyStudyGoal) {
        switch (user.preferences.dailyStudyGoal) {
            case '30 minutes':
                targetTopics = 5;
                break;
            case '1 hour':
                targetTopics = 8;
                break;
            case '2 hours':
                targetTopics = 12;
                break;
            case '3 hours':
                targetTopics = 15;
                break;
            case '4+ hours':
                targetTopics = 20;
                break;
        }
    }

    const topics = await Topic.find({ user: userId })
        .populate('subject', 'name examDate')
        .sort({ priorityScore: -1 })
        .limit(targetTopics);
    return topics;
};

module.exports = {
    getStudySchedule,
    updatePriorityScores,
    calculateNextReviewDate,
};
