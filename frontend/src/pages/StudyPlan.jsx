import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAIStudySchedule, reset } from '../features/study/studySlice';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const StudyPlan = () => {
    const dispatch = useDispatch();
    const {
        aiSchedule: studyPlan,
        isLoading: loading,
        isError,
        message
    } = useSelector((state) => state.study);

    const error = isError ? message : '';

    useEffect(() => {
        dispatch(getAIStudySchedule());

        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const statusCounts = { new: 0, learning: 0, revised: 0 };
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };

    if (Array.isArray(studyPlan)) {
        studyPlan.forEach((topic) => {
            if (topic && topic.status) statusCounts[topic.status]++;
            if (topic && topic.difficulty) difficultyCounts[topic.difficulty]++;
        });
    }

    const isReviewOverdue = (nextReviewDate) => {
        return nextReviewDate && new Date(nextReviewDate) < new Date();
    };

    const COLORS = ['#FF6384', '#36A2EB', '#4BC0C0'];
    const DIFFICULTY_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    const statusChartData = Object.keys(statusCounts).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: statusCounts[key],
    }));

    const difficultyChartData = Object.keys(difficultyCounts).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: difficultyCounts[key],
    }));

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'learning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'revised': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="gradient-bg min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your study plan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gradient-bg min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Your Study Progress 🧠
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Personalized study schedule optimized for your learning goals
                    </p>
                </div>

                {error && (
                    <div className="card p-6 mb-8 border-l-4 border-red-500">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && studyPlan.length === 0 && !error && (
                    <div className="card p-8 text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📖</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Topics Available</h3>
                        <p className="text-gray-600 mb-6">
                            Start by adding subjects and topics to see your personalized study plan.
                        </p>
                        <div className="space-x-4">
                            <a href="/subjects" className="btn-primary">
                                Add Subjects
                            </a>
                            <a href="/topics" className="btn-secondary">
                                Add Topics
                            </a>
                        </div>
                    </div>
                )}

                {!loading && studyPlan.length > 0 && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="card p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Topics</p>
                                        <p className="text-2xl font-bold text-gray-900">{studyPlan.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Revised</p>
                                        <p className="text-2xl font-bold text-gray-900">{statusCounts.revised || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Learning</p>
                                        <p className="text-2xl font-bold text-gray-900">{statusCounts.learning || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Status Distribution */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Status Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Difficulty Distribution */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Difficulty Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={difficultyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#8884d8">
                                            {difficultyChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[index % DIFFICULTY_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Study Plan List */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Study Plan</h3>
                            <div className="space-y-4">
                                {studyPlan.map((topic, index) => (
                                    <div key={topic._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                                                    <h4 className="text-lg font-semibold text-gray-900">{topic.name}</h4>
                                                    {isReviewOverdue(topic.nextReviewDate) && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-3">
                                                    Subject: <span className="font-medium">{topic.subject?.name || 'Unknown'}</span>
                                                </p>
                                                <div className="flex items-center space-x-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(topic.status)}`}>
                                                        {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(topic.difficulty)}`}>
                                                        {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Priority: {topic.priorityScore?.toFixed(1) || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {topic.nextReviewDate && (
                                                    <div className="text-sm text-gray-500">
                                                        Next Review: {new Date(topic.nextReviewDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudyPlan; 