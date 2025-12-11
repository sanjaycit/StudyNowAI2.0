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

const DEFAULT_DAYS_IF_NO_EXAM = 365 * 5; // treat no-exam as far in future
const RESCHEDULE_PENALTY = 1;   // decrement credits when a topic is rescheduled
const ON_TIME_REWARD = 1;       // increment credits when studied on scheduled date

// helper: get integer days difference (date-only)
function daysBetween(a, b) {
    const A = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const B = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    const ms = B - A;
    return Math.round(ms / (24 * 60 * 60 * 1000));
}

// map dailyStudyGoal to topics per day (fallback)
function topicsPerDayForUser(user) {
    if (user?.preferences?.topicsPerDay) return user.preferences.topicsPerDay;
    const goal = user?.preferences?.dailyStudyGoal || '1 hour';
    switch (goal) {
        case '30 minutes': return 3;
        case '1 hour': return 5;
        case '2 hours': return 8;
        case '3 hours': return 12;
        case '4+ hours': return 16;
        default: return 5;
    }
}

/**
 * buildSchedule(userId, startDate, horizonDays)
 * - main planner: schedules topics across days (startDate..startDate + horizonDays -1)
 * - ensures topics for subjects with exams get scheduled before exam
 */
async function buildSchedule(userId, startDate = new Date(), horizonDays = 30) {
    const User = require('../models/userModel');
    const user = await User.findById(userId);
    // Find topics that are NOT completed
    const topics = await Topic.find({
        user: userId,
        status: { $ne: 'completed' }
    }).populate('subject');
    const today = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    // group topics by subject
    const subjectsMap = {};
    topics.forEach(t => {
        const sid = String(t.subject?._id || 'no-subject');
        subjectsMap[sid] = subjectsMap[sid] || { subject: t.subject, topics: [] };
        subjectsMap[sid].topics.push(t);
    });

    // compute slots: how many topic slots available for each day
    const topicsPerDay = topicsPerDayForUser(user);

    // create an array of day slots with date and capacity
    const scheduleDays = [];
    for (let i = 0; i < horizonDays; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        scheduleDays.push({
            date: d,
            capacity: topicsPerDay,
            assigned: []
        });
    }

    // for each subject compute urgency (days until exam) and sort topics within subject by completion ascending
    const subjectBuckets = Object.values(subjectsMap).map(bucket => {
        const subj = bucket.subject || { _id: null, examDate: null, name: 'General' };
        const examDate = subj.examDate ? new Date(subj.examDate) : null;
        const daysUntilExam = examDate ? daysBetween(today, examDate) : DEFAULT_DAYS_IF_NO_EXAM;
        // topics least-completed first
        bucket.topics.sort((a, b) => (a.completionPercent || 0) - (b.completionPercent || 0));
        return { subject: subj, daysUntilExam, topics: bucket.topics };
    });

    // sort subjects by urgency: closest exam first (low daysUntilExam first)
    subjectBuckets.sort((a, b) => a.daysUntilExam - b.daysUntilExam);

    // simple allocation: iterate days from today -> horizon, for each day fill slots
    for (const daySlot of scheduleDays) {
        while (daySlot.capacity > daySlot.assigned.length) {
            let chosen = null;
            // iterate subjectBuckets in priority order to find a candidate topic
            for (const sb of subjectBuckets) {
                // skip subjects already fully scheduled / completed for this pass
                if (!sb.topics || sb.topics.length === 0) continue;

                // if subject's exam is before this day => skip (too late)
                const examDate = sb.subject?.examDate ? new Date(sb.subject.examDate) : null;
                if (examDate && examDate < daySlot.date) {
                    continue;
                }

                // choose the first (lowest completion) topic
                // But check if it's already scheduled in the future in DB?
                // The algorithm says: "For each run... produce scheduledDate".
                // We overwrite scheduledDate.

                const candidate = sb.topics[0];

                // Check if candidate is already assigned in THIS schedule run (previous days)
                // We removed it from sb.topics when assigned, so it won't be picked again.
                // But we should also check if it has a scheduledDate > today from previous runs?
                // The prompt implies we reschedule daily.
                // However, "Detect missed topics" relies on scheduledDate.
                // Logic:
                // We re-plan everything from Today onwards.

                chosen = { bucket: sb, topic: candidate };
                break;
            }

            if (!chosen) break; // no candidate found for this day

            // assign chosen
            daySlot.assigned.push(chosen.topic);
            chosen.topic._tentativeScheduledDate = daySlot.date;
            // remove from sb.topics queue
            chosen.bucket.topics.shift();
        }
    }

    // persist tentative schedules to DB and add scheduleHistory entry
    const bulkOps = [];
    for (const day of scheduleDays) {
        for (const t of day.assigned) {
            // Only set scheduledDate if it changes significantly
            const newDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
            const prev = t.scheduledDate ? new Date(t.scheduledDate.getFullYear(), t.scheduledDate.getMonth(), t.scheduledDate.getDate()) : null;

            // If it's already scheduled for this date, do nothing, unless we want to confirm reschedule=false
            if (prev && prev.getTime() === newDate.getTime() && !t.rescheduled) continue;

            // create update op
            bulkOps.push({
                updateOne: {
                    filter: { _id: t._id },
                    update: {
                        $set: { scheduledDate: newDate, rescheduled: false },
                        $push: {
                            scheduleHistory: {
                                date: newDate,
                                action: 'scheduled',
                                reason: 'auto-schedule',
                                timestamp: new Date()
                            }
                        }
                    }
                }
            });
        }
    }

    if (bulkOps.length) {
        await Topic.bulkWrite(bulkOps);
    }

    return scheduleDays;
}

/**
 * detectAndHandleMissedTopics(userId, checkDate)
 * - Check topics that were scheduled for `checkDate` and detect if user made progress based on completion %
 * - If no progress, reschedule to next day (or next available day) and decrement credits
 * - If progress, mark completed for that slot and increment credits
 */
async function detectAndHandleMissedTopics(userId, checkDate = new Date()) {
    const User = require('../models/userModel');
    const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);

    // find topics that were scheduled for this day
    const todaysTopics = await Topic.find({
        user: userId,
        scheduledDate: { $gte: dayStart, $lt: dayEnd }
    });

    const bulkOps = [];
    let creditsDelta = 0;

    for (const t of todaysTopics) {
        // detect progress: compare lastSnapshotPercent vs current completionPercent
        const prevPercent = typeof t.lastSnapshotPercent === 'number' ? t.lastSnapshotPercent : t.completionPercent;
        const currPercent = t.completionPercent || 0;

        if (currPercent > prevPercent || t.status === 'completed') {
            // user studied this topic on scheduled date
            creditsDelta += ON_TIME_REWARD;
            bulkOps.push({
                updateOne: {
                    filter: { _id: t._id },
                    update: {
                        $set: { rescheduled: false, lastStudiedAt: new Date(), lastSnapshotPercent: currPercent },
                        $push: {
                            scheduleHistory: {
                                date: dayStart,
                                action: 'completed',
                                reason: 'studied-on-schedule',
                                timestamp: new Date()
                            }
                        }
                    }
                }
            });
        } else {
            // user did not study -> reschedule to next available day (simple: next day)
            const nextDate = new Date(dayStart); nextDate.setDate(dayStart.getDate() + 1);
            creditsDelta -= RESCHEDULE_PENALTY;

            bulkOps.push({
                updateOne: {
                    filter: { _id: t._id },
                    update: {
                        $set: { scheduledDate: nextDate, rescheduled: true, lastSnapshotPercent: currPercent },
                        $push: {
                            scheduleHistory: {
                                date: nextDate,
                                action: 'rescheduled',
                                reason: 'missed-on-schedule',
                                timestamp: new Date()
                            }
                        }
                    }
                }
            });
        }
    }

    if (bulkOps.length) {
        await Topic.bulkWrite(bulkOps);
    }

    if (creditsDelta !== 0) {
        await User.updateOne({ _id: userId }, { $inc: { credits: creditsDelta } });
    }

    return { processed: todaysTopics.length, creditsDelta };
}

/**
 * small utility to snapshot today's completionPercent into lastSnapshotPercent
 * should be run at end-of-day (so tomorrow we can detect delta)
 */
async function snapshotCompletionPercentForUser(userId) {
    // find topics for user and set lastSnapshotPercent = completionPercent
    const topics = await Topic.find({ user: userId });
    const ops = topics.map(t => ({
        updateOne: {
            filter: { _id: t._id },
            update: { $set: { lastSnapshotPercent: t.completionPercent || 0 } }
        }
    }));
    if (ops.length) await Topic.bulkWrite(ops);
}

// Get the study schedule (Orchestrator)
const getStudySchedule = async (userId) => {
    const User = require('../models/userModel');
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const user = await User.findById(userId);

    if (!user) return [];

    // Check if we need to run daily maintenance (check yesterday)
    // Runs only once per day
    if (!user.lastScheduleCheck || user.lastScheduleCheck < todayMidnight) {
        const yesterday = new Date(todayMidnight);
        yesterday.setDate(yesterday.getDate() - 1);

        await detectAndHandleMissedTopics(userId, yesterday);
        await snapshotCompletionPercentForUser(userId);

        user.lastScheduleCheck = new Date();
        await user.save();
    }

    // Build/Update schedule for next 2 weeks
    await buildSchedule(userId, todayMidnight, 14);

    // Return topics scheduled for TODAY
    const scheduledTopics = await Topic.find({
        user: userId,
        scheduledDate: { $gte: todayMidnight, $lt: new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000) }
    }).populate('subject', 'name examDate');

    return scheduledTopics;
};



// Get entire upcoming schedule (grouped by date)
const getFullSchedule = async (userId) => {
    // Ensure schedule is up-to-date
    await getStudySchedule(userId);

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endDate = new Date(todayMidnight);
    endDate.setDate(endDate.getDate() + 30); // Get next 30 days

    const topics = await Topic.find({
        user: userId,
        scheduledDate: { $gte: todayMidnight, $lt: endDate }
    }).populate('subject', 'name examDate').sort({ scheduledDate: 1 });

    // Group by date
    const scheduleByDate = {};
    topics.forEach(t => {
        const dateStr = t.scheduledDate.toLocaleDateString('en-CA');
        if (!scheduleByDate[dateStr]) {
            scheduleByDate[dateStr] = [];
        }
        scheduleByDate[dateStr].push(t);
    });

    return scheduleByDate;
};

module.exports = {
    getStudySchedule,
    getFullSchedule,
    updatePriorityScores,
    calculateNextReviewDate,
    buildSchedule,
    detectAndHandleMissedTopics,
    snapshotCompletionPercentForUser
};
