const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: String,
    type: String,
    description: String,
    relevance: Number,
    url: String
}, { _id: true });

const RoadmapStepSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    resources: [ResourceSchema],
    quiz: {
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number,
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard']
            }
        }],
        results: {
            score: Number,
            percentage: Number,
            areasToImprove: String,
            completedAt: Date
        }
    }
}, { _id: true });

const TopicSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['new', 'learning', 'revised', 'completed'],
        default: 'new',
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    completionPercent: {
        type: Number,
        default: 0
    },
    scheduledDate: {
        type: Date
    },
    rescheduled: {
        type: Boolean,
        default: false
    },
    scheduleHistory: [{
        date: Date,
        action: String, // 'scheduled' | 'rescheduled' | 'completed' | 'skipped'
        reason: String,
        timestamp: Date
    }],
    lastSnapshotPercent: {
        type: Number,
        default: 0
    },
    lastStudiedAt: Date,
    priorityScore: {
        type: Number,
        default: 0,
    },
    lastReviewed: {
        type: Date,
        default: null,
    },
    nextReviewDate: {
        type: Date,
        default: null,
    },
    repetitionLevel: {
        type: Number,
        default: 0,
    },
    roadmap: [RoadmapStepSchema],
    quiz: {
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number, // Index of correct option
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard']
            }
        }],
        results: {
            score: Number,
            percentage: Number,
            areasToImprove: String,
            completedAt: Date
        }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Topic', TopicSchema);
