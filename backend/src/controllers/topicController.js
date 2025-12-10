const Topic = require('../models/topicModel');
const { calculateNextReviewDate } = require('../services/studyService');
const { generateRoadmap, generateQuiz } = require('../services/aiService');

// @desc    Get all topics for a user
// @route   GET /api/topics
// @access  Private
const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find({ user: req.user.id }).populate('subject', 'name');
        res.status(200).json(topics);
    } catch (error) {
        console.error('Get Topics Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching topics' });
    }
};

// @desc    Get a single topic
// @route   GET /api/topics/:id
// @access  Private
const getTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        res.status(200).json(topic);
    } catch (error) {
        console.error('Get Topic Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching topic' });
    }
};

// @desc    Create a topic
// @route   POST /api/topics
// @access  Private
const createTopic = async (req, res) => {
    const { subject, name, status = 'new', difficulty = 'medium' } = req.body;

    try {
        const newTopic = new Topic({
            user: req.user.id,
            subject,
            name,
            status,
            difficulty,
        });

        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (error) {
        console.error('Create Topic Error:', error.message);
        res.status(500).json({ message: 'Server error while creating topic' });
    }
};

// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Private
const updateTopic = async (req, res) => {
    const { subject, name, status, difficulty } = req.body;

    try {
        let topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        topic.subject = subject || topic.subject;
        topic.name = name || topic.name;
        topic.status = status || topic.status;
        topic.difficulty = difficulty || topic.difficulty;

        // If a topic is revised, update review dates
        if (status === 'revised') {
            topic.lastReviewed = new Date();
            topic.nextReviewDate = calculateNextReviewDate(topic.difficulty, topic.lastReviewed);
        }

        const updatedTopic = await topic.save();
        res.status(200).json(updatedTopic);
    } catch (error) {
        console.error('Update Topic Error:', error.message);
        res.status(500).json({ message: 'Server error while updating topic' });
    }
};

// @desc    Delete a topic
// @route   DELETE /api/topics/:id
// @access  Private
const deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        await Topic.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('Delete Topic Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting topic' });
    }
};

// @desc    Mark a topic as reviewed
// @route   PUT /api/topics/:id/review
// @access  Private
const reviewTopic = async (req, res) => {
    try {
        let topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        topic.status = 'revised';
        topic.lastReviewed = new Date();
        // Increment repetition level, default to 0 if undefined
        topic.repetitionLevel = (topic.repetitionLevel || 0) + 1;
        topic.nextReviewDate = calculateNextReviewDate(topic.difficulty, topic.lastReviewed, topic.repetitionLevel);

        const updatedTopic = await topic.save();
        res.status(200).json(updatedTopic);

    } catch (error) {
        console.error('Review Topic Error:', error.message);
        res.status(500).json({ message: 'Server error while reviewing topic' });
    }
};

// @desc    Generate a roadmap for a topic using AI
// @route   POST /api/topics/:id/roadmap
// @access  Private
const generateTopicRoadmap = async (req, res) => {
    console.log(`[Topic Controller] generateTopicRoadmap called for ID: ${req.params.id}`);
    try {
        const topic = await Topic.findById(req.params.id).populate('subject');

        if (!topic) {
            console.log("[Topic Controller] Topic not found");
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user.id) {
            console.log("[Topic Controller] Unauthorized access");
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        if (topic.roadmap && topic.roadmap.length > 0) {
            console.log("[Topic Controller] Returning existing roadmap");
            return res.status(200).json(topic); // Return existing roadmap if available
        }

        console.log("[Topic Controller] Calling AI service...");
        const roadmapData = await generateRoadmap(topic.name, topic.subject.name, topic.difficulty);
        console.log(`[Topic Controller] Roadmap data received: ${JSON.stringify(roadmapData).substring(0, 100)}...`);

        topic.roadmap = roadmapData.map(step => ({
            ...step,
            status: 'pending'
        }));

        await topic.save();
        console.log("[Topic Controller] Topic saved with new roadmap");
        res.status(200).json(topic);

    } catch (error) {
        console.error('Generate Roadmap Error:', error.message);
        res.status(500).json({ message: 'Server error while generating roadmap' });
    }
};

const getStepResources = async (req, res) => {
    const { stepTitle } = req.body;
    try {
        const topic = await Topic.findById(req.params.id).populate('subject');

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Find the step in the roadmap
        const step = topic.roadmap.find(s => s.title === stepTitle);

        if (!step) {
            return res.status(404).json({ message: 'Step not found in roadmap' });
        }

        // Check if resources already exist
        if (step.resources && step.resources.length > 0) {
            console.log(`[Topic Controller] Returning existing resources for step: ${stepTitle}`);
            return res.status(200).json(step.resources);
        }

        console.log(`[Topic Controller] Generating new resources for step: ${stepTitle}`);
        const { generateStepResources } = require('../services/aiService');
        const resources = await generateStepResources(stepTitle, topic.name, topic.subject.name);

        if (!Array.isArray(resources)) {
            console.error('[Topic Controller] Critical Error: AI Service returned non-array:', typeof resources);
            return res.status(500).json({ message: 'Failed to generate valid resources' });
        }

        console.log(`[Topic Controller] Resources type: ${typeof resources}, isArray: ${Array.isArray(resources)}, Length: ${resources.length}`);
        if (resources.length > 0) {
            console.log(`[Topic Controller] First resource sample:`, resources[0]);
        }

        // Safely set resources
        // Clear existing if any (though logic above checks length > 0, explicit clear is safer if logic changes)
        step.resources = [];

        resources.forEach(r => {
            step.resources.push({
                title: r.title,
                type: r.type,
                description: r.description,
                relevance: r.relevance,
                url: r.url
            });
        });

        await topic.save();
        console.log(`[Topic Controller] Saved ${resources.length} resources to DB`);

        res.status(200).json(step.resources);
    } catch (error) {
        console.error('Get Resources Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching resources' });
    }
};

const getTopicQuiz = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id).populate('subject');

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        // Check if quiz already exists
        if (topic.quiz && topic.quiz.questions && topic.quiz.questions.length > 0) {
            // Return questions without correct answers for security
            const questionsForFrontend = topic.quiz.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options,
                difficulty: q.difficulty
            }));
            return res.status(200).json(questionsForFrontend);
        }

        // Generate quiz
        console.log("[Topic Controller] Generating quiz...");
        const quizQuestions = await generateQuiz(topic.name, topic.subject.name);

        topic.quiz = {
            questions: quizQuestions,
            results: null
        };

        await topic.save();

        const questionsForFrontend = topic.quiz.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty
        }));

        res.status(200).json(questionsForFrontend);

    } catch (error) {
        console.error('Get Quiz Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching quiz' });
    }
};

const submitTopicQuiz = async (req, res) => {
    const { answers } = req.body; // Array of indices corresponding to questions
    // Expecting answers to be an array of objects: { questionId, selectedOptionIndex } OR just ordered array if we trust order.
    // Better: Map { questionId: index } or just array of indices matching the order sent.
    // Let's assume ordered array of indices for simplicity as we send them sorted.
    // Actually, safest is { [questionId]: selectedIndex }.

    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (!topic.quiz || !topic.quiz.questions || topic.quiz.questions.length === 0) {
            return res.status(400).json({ message: 'No quiz generated for this topic' });
        }

        let correctCount = 0;
        const totalQuestions = topic.quiz.questions.length;
        const missedDifficulties = {};

        // Calculate score
        // We assume 'answers' is an array of indices matching the questions order, 
        // OR an object with question indices.
        // Let's assume input: { answers: [0, 2, 1, ... ] } corresponding to questions 0..14.

        topic.quiz.questions.forEach((q, index) => {
            const userAns = answers[index];
            if (userAns !== undefined && userAns === q.correctAnswer) {
                correctCount++;
            } else {
                // Track missed difficulties
                missedDifficulties[q.difficulty] = (missedDifficulties[q.difficulty] || 0) + 1;
            }
        });

        const percentage = (correctCount / totalQuestions) * 100;

        // Determine areas to improve
        let areasToImprove = "None! Perfect score.";
        if (percentage < 100) {
            const difficulties = Object.keys(missedDifficulties);
            if (difficulties.length > 0) {
                areasToImprove = `You need to focus more on ${difficulties.join(', ')} level questions.`;
            } else {
                areasToImprove = "Review the topic materials securely.";
            }
        }

        // Save results
        topic.quiz.results = {
            score: correctCount,
            percentage: percentage,
            areasToImprove: areasToImprove,
            completedAt: new Date()
        };

        // Mark topic as completed
        topic.status = 'completed';

        await topic.save();

        // Check if all topics in subject are completed
        // (Optional: Logic to mark Subject completed if we had that field)
        const allTopics = await Topic.find({ subject: topic.subject });
        const allCompleted = allTopics.every(t => t.status === 'completed');

        res.status(200).json({
            score: correctCount,
            total: totalQuestions,
            percentage,
            areasToImprove,
            subjectCompleted: allCompleted
        });

    } catch (error) {
        console.error('Submit Quiz Error:', error.message);
        res.status(500).json({ message: 'Server error while submitting quiz' });
    }
};

const getStepQuiz = async (req, res) => {
    const { stepIndex } = req.params; // Using index as ID roughly
    try {
        const topic = await Topic.findById(req.params.id).populate('subject');

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        const stepIdx = parseInt(stepIndex);
        if (isNaN(stepIdx) || stepIdx < 0 || stepIdx >= topic.roadmap.length) {
            return res.status(404).json({ message: 'Step not found' });
        }

        const step = topic.roadmap[stepIdx];

        // Check if quiz exists
        if (step.quiz && step.quiz.questions && step.quiz.questions.length > 0) {
            const questionsForFrontend = step.quiz.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options,
                difficulty: q.difficulty
            }));
            return res.status(200).json(questionsForFrontend);
        }

        // Generate quiz for this step
        console.log(`[Topic Controller] Generating quiz for step: ${step.title}`);
        const quizQuestions = await generateQuiz(topic.name, topic.subject.name, step.title);

        step.quiz = {
            questions: quizQuestions,
            results: null
        };

        await topic.save();

        const questionsForFrontend = step.quiz.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty
        }));

        res.status(200).json(questionsForFrontend);

    } catch (error) {
        console.error('Get Step Quiz Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching step quiz' });
    }
};

const submitStepQuiz = async (req, res) => {
    const { stepIndex } = req.params;
    const { answers } = req.body;

    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const stepIdx = parseInt(stepIndex);
        if (isNaN(stepIdx) || stepIdx < 0 || stepIdx >= topic.roadmap.length) {
            return res.status(404).json({ message: 'Step not found' });
        }

        const step = topic.roadmap[stepIdx];

        if (!step.quiz || !step.quiz.questions || step.quiz.questions.length === 0) {
            return res.status(400).json({ message: 'No quiz generated for this step' });
        }

        let correctCount = 0;
        const totalQuestions = step.quiz.questions.length;
        const missedDifficulties = {};

        step.quiz.questions.forEach((q, index) => {
            const userAns = answers[index];
            if (userAns !== undefined && userAns === q.correctAnswer) {
                correctCount++;
            } else {
                missedDifficulties[q.difficulty] = (missedDifficulties[q.difficulty] || 0) + 1;
            }
        });

        const percentage = (correctCount / totalQuestions) * 100;

        // Determine areas to improve for this step
        let areasToImprove = "None! Perfect score.";
        if (percentage < 100) {
            const difficulties = Object.keys(missedDifficulties);
            if (difficulties.length > 0) {
                areasToImprove = `For step "${step.title}", focus more on ${difficulties.join(', ')} level concepts.`;
            } else {
                areasToImprove = "Review the step materials.";
            }
        }

        // Save results
        step.quiz.results = {
            score: correctCount,
            percentage: percentage,
            areasToImprove: areasToImprove,
            completedAt: new Date()
        };

        // Mark step as completed if passed (e.g. > 50%)
        // The user requirement: "After person completes a full quiz, teh topic has to be marked completed."
        // Assuming "Topic" means "Step" here, or the big topic.
        // Assuming completion regardless of score for now, or enforcing specific pass rate?
        // Let's mark completed if they submitted.

        step.status = 'completed';

        // Check if ALL steps are completed
        const allStepsCompleted = topic.roadmap.every(s => s.status === 'completed');

        // If all steps completed, mark Topic as completed
        let topicJustCompleted = false;
        if (allStepsCompleted && topic.status !== 'completed') {
            topic.status = 'completed';
            topicJustCompleted = true;
        }

        await topic.save();

        res.status(200).json({
            score: correctCount,
            total: totalQuestions,
            percentage,
            areasToImprove,
            stepCompleted: true,
            topicCompleted: topicJustCompleted || topic.status === 'completed'
        });

    } catch (error) {
        console.error('Submit Step Quiz Error:', error.message);
        res.status(500).json({ message: 'Server error while submitting step quiz' });
    }
};

module.exports = {
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
};
