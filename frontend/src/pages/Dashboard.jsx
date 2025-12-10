import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTopics, getSubjects } from '../features/study/studySlice';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { topics, isLoading, isError, message } = useSelector((state) => state.study);
    const [activeTab, setActiveTab] = useState('new');

    useEffect(() => {
        dispatch(getTopics());
        dispatch(getSubjects());
    }, [dispatch]);

    const newTopics = topics.filter(t => t.status === 'new');
    const learningTopics = topics.filter(t => t.status === 'learning');
    const revisedTopics = topics.filter(t => t.status === 'revised');

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const tabs = [
        { id: 'new', label: 'New Topics', count: newTopics.length, icon: '🆕' },
        { id: 'learning', label: 'Learning', count: learningTopics.length, icon: '📖' },
        { id: 'revise', label: 'Revise', count: revisedTopics.length, icon: '✅' },
    ];

    const currentTopics = activeTab === 'new' ? newTopics
        : activeTab === 'learning' ? learningTopics
            : revisedTopics;

    if (isLoading) {
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
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                            <p className="mt-2 text-gray-500">Track your progress and manage your study topics.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                                Total Topics: {topics.length}
                            </span>
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
                    <div className="border-b border-gray-200 bg-gray-50/50">
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex-1 min-w-[150px] py-4 px-6 text-sm font-medium text-center focus:outline-none transition-colors duration-200 border-b-2
                                        ${activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600 bg-white'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                                    `}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-lg">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
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
                                                {activeTab === 'new' ? '📝' : activeTab === 'learning' ? '🤔' : '🎉'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            {activeTab === 'new'
                                                ? 'You have no new topics. Start by adding some in the Topics selection!'
                                                : activeTab === 'learning'
                                                    ? 'You are not currently learning any topics. Pick one from "New" to start.'
                                                    : 'You haven\'t revised any topics yet. Keep studying!'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {currentTopics.map((topic) => (
                                            <div
                                                key={topic._id}
                                                className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col h-full"
                                            >
                                                <div className="p-5 flex-1">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(topic.difficulty)}`}>
                                                            {topic.difficulty}
                                                        </span>
                                                        {topic.subject && (
                                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                {topic.subject.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                        {topic.name}
                                                    </h3>
                                                </div>
                                                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex justify-between items-center decoration-gray-900">
                                                    <div className="text-xs text-gray-500">
                                                        {topic.status === 'revised' && topic.lastReviewed
                                                            ? `Last reviewed: ${new Date(topic.lastReviewed).toLocaleDateString()}`
                                                            : 'Ready to study'}
                                                    </div>
                                                    <a
                                                        href={`/study/${topic._id}`}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Start Study
                                                    </a>
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
