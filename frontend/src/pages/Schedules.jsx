import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getFullSchedule } from '../features/study/studySlice';
import { motion } from 'framer-motion';

const Schedules = () => {
    const dispatch = useDispatch();
    const { fullSchedule, isLoading } = useSelector((state) => state.study);

    // Refresh schedule on mount
    useEffect(() => {
        dispatch(getFullSchedule());
    }, [dispatch]);

    if (isLoading && !fullSchedule) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading schedule...</p>
                </div>
            </div>
        );
    }

    const sortedDates = fullSchedule ? Object.keys(fullSchedule).sort() : [];

    const formatDate = (dateString) => {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        // Valid dateString from backend is YYYY-MM-DD. Append T00:00:00 to force local time interpretation
        const date = new Date(`${dateString}T00:00:00`);
        return date.toLocaleDateString('en-US', options);
    };

    const isToday = (dateString) => {
        const today = new Date();
        const d = new Date(`${dateString}T00:00:00`);
        return today.toDateString() === d.toDateString();
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                        Your Schedule
                    </h1>
                    <p className="mt-2 text-gray-500 text-lg">
                        Stay organized with your upcoming study timeline.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!sortedDates.length ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6">
                            <span className="text-4xl">📅</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Schedule Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            It looks like you don't have any topics scheduled for the upcoming days.
                            Add topics or set an exam date to generate a plan!
                        </p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-blue-200 space-y-12 ml-4 md:ml-6">
                        {sortedDates.map((date, index) => (
                            <motion.div
                                key={date}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative pl-8 md:pl-12"
                            >
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${isToday(date) ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'}`}></div>

                                {/* Date Header */}
                                <h2 className={`text-xl font-bold mb-6 flex items-center ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {isToday(date) && <span className="mr-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Today</span>}
                                    {formatDate(date)}
                                </h2>

                                {/* Topics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fullSchedule[date].map((topic) => (
                                        <div
                                            key={topic._id}
                                            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getDifficultyColor(topic.difficulty)}`}>
                                                    {topic.difficulty}
                                                </span>
                                                {topic.subject && (
                                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                        {topic.subject.name}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                {topic.name}
                                            </h3>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className="mr-3">
                                                        Status: <span className="font-medium text-gray-700 capitalize">{topic.status}</span>
                                                    </span>
                                                </div>

                                                <a
                                                    href={`/study/${topic._id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                                                >
                                                    Start Studying
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedules;
