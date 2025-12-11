import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTopics, getSubjects, getAIStudySchedule } from '../features/study/studySlice';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { topics, aiSchedule, isLoading, isError, message } = useSelector((state) => state.study);
    const [activeTab, setActiveTab] = useState('scheduled');

    useEffect(() => {
        dispatch(getTopics());
        dispatch(getSubjects());
        dispatch(getAIStudySchedule());
    }, [dispatch]);

    const newTopics = topics.filter(t => t.status === 'new');
    const learningTopics = topics.filter(t => t.status === 'learning');
    const revisedTopics = topics.filter(t => t.status === 'revised');
    const completedTopics = topics.filter(t => t.status === 'completed');

    const calculateProgress = (topic) => {
        if (!topic.roadmap || topic.roadmap.length === 0) return 0;
        const completedSteps = topic.roadmap.filter(step => step.status === 'completed').length;
        return Math.round((completedSteps / topic.roadmap.length) * 100);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'learning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'revised': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const isReviewOverdue = (nextReviewDate) => {
        return nextReviewDate && new Date(nextReviewDate) < new Date();
    };

    const tabs = [
        { id: 'scheduled', label: "Today's Plan", count: aiSchedule.length, icon: '📅' },
        { id: 'new', label: 'New Topics', count: newTopics.length, icon: '🆕' },
        { id: 'learning', label: 'Learning', count: learningTopics.length, icon: '📖' },
        { id: 'revise', label: 'Revise', count: revisedTopics.length, icon: '✅' },
        { id: 'completed', label: 'Completed', count: completedTopics.length, icon: '🏆' },
    ];

    const currentTopics = activeTab === 'scheduled' ? aiSchedule
        : activeTab === 'new' ? newTopics
            : activeTab === 'learning' ? learningTopics
                : activeTab === 'revise' ? revisedTopics
                    : completedTopics;

    if (isLoading && !topics.length && !aiSchedule.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">Dashboard</h1>
                            <p className="mt-2 text-gray-500 text-lg">Detailed overview of your study progress.</p>
                        </div>
                        <div className="mt-6 md:mt-0 flex gap-4">
                            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex flex-col items-center">
                                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total</span>
                                <span className="text-2xl font-bold text-blue-900">{topics.length}</span>
                            </div>
                            <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 flex flex-col items-center">
                                <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Completed</span>
                                <span className="text-2xl font-bold text-green-900">{completedTopics.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-500">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Topics Board */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
                    {/* Tabs Header */}
                    <div className="border-b border-gray-100 px-8 pt-6">
                        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-fit">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                                    `}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>{tab.label}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold leading-none ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {currentTopics.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                                            <span className="text-4xl opacity-50">
                                                {activeTab === 'new' ? '📝' : activeTab === 'learning' ? '🤔' : activeTab === 'completed' ? '🏆' : activeTab === 'scheduled' ? '📅' : '🎉'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            {activeTab === 'new'
                                                ? 'You have no new topics. Start by adding some in the Topics selection!'
                                                : activeTab === 'learning'
                                                    ? 'You are not currently learning any topics. Pick one from "New" to start.'
                                                    : activeTab === 'scheduled'
                                                        ? 'No study tasks scheduled for today. Good job!'
                                                        : activeTab === 'completed'
                                                            ? 'You haven\'t completed any topics yet. Keep going!'
                                                            : 'You haven\'t revised any topics yet. Keep studying!'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {currentTopics.map((topic) => (
                                            <div
                                                key={topic._id}
                                                className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
                                            >
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                            {topic.name}
                                                        </h3>
                                                        <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getDifficultyColor(topic.difficulty)}`}>
                                                            {topic.difficulty}
                                                        </span>
                                                    </div>

                                                    <div className="mb-6 flex-1">
                                                        {topic.subject && (
                                                            <p className="text-sm font-medium text-gray-400 mb-4">
                                                                {topic.subject.name}
                                                            </p>
                                                        )}

                                                        {/* Progress Bar */}
                                                        <div>
                                                            <div className="flex justify-between items-end text-xs mb-2">
                                                                <span className="font-semibold text-gray-600">Progress</span>
                                                                <span className="font-bold text-blue-600">{calculateProgress(topic)}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-500 ${calculateProgress(topic) === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                                                    style={{ width: `${calculateProgress(topic)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                        <span className="text-xs font-medium text-gray-400">
                                                            {topic.status === 'revised' ? 'Revised' : topic.status === 'new' ? 'New' : topic.status === 'completed' ? 'Completed' : 'In Progress'}
                                                        </span>
                                                        <a
                                                            href={`/study/${topic._id}`}
                                                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
                                                            title={activeTab === 'completed' ? 'Review Again' : 'Continue Studying'}
                                                        >
                                                            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
