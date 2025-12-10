// This page lets users manage topics for their subjects
// File: /src/pages/Topics.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getTopics, createTopic, updateTopic, deleteTopic, reviewTopic, getSubjects, reset } from '../features/study/studySlice';
import { toast } from 'react-hot-toast';

const Topics = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { subjects, topics, isLoading, isError, message } = useSelector((state) => state.study);

    const [form, setForm] = useState({
        subject: '',
        name: '',
        status: 'new',
        difficulty: 'medium',
    });
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState('');
    const [isReviewing, setIsReviewing] = useState(null);

    useEffect(() => {
        dispatch(getSubjects());
        dispatch(getTopics());

        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const handleReset = () => {
        setForm({ ...form, name: '', status: 'new', difficulty: 'medium' });
        setEditingId(null);
        setFormError('');
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === 'name' && (formError || isError)) {
            setFormError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.subject || !form.name) {
            setFormError('Please select a subject and enter a topic name.');
            return;
        }

        const topicData = { ...form };

        if (editingId) {
            dispatch(updateTopic({ id: editingId, ...topicData }));
        } else {
            dispatch(createTopic(topicData));
        }
        handleReset();
    };

    const handleEdit = (topic) => {
        setForm({
            subject: topic.subject._id,
            name: topic.name,
            status: topic.status,
            difficulty: topic.difficulty,
        });
        setEditingId(topic._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this topic?')) {
            dispatch(deleteTopic(id));
        }
    };

    const handleReview = async (topicId) => {
        setIsReviewing(topicId);
        try {
            await dispatch(reviewTopic(topicId)).unwrap();
            toast.success('Topic marked as reviewed!');
        } catch (error) {
            console.error('Error marking topic as reviewed:', error);
            toast.error('Failed to mark topic as reviewed');
        } finally {
            setIsReviewing(null);
        }
    };

    const calculateProgress = (topic) => {
        if (!topic.roadmap || topic.roadmap.length === 0) return 0;
        const completedSteps = topic.roadmap.filter(step => step.status === 'completed').length;
        return Math.round((completedSteps / topic.roadmap.length) * 100);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'learning': return 'bg-yellow-100 text-yellow-800';
            case 'revised': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="gradient-bg min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Topics ✏️</h1>
                    <p className="text-gray-600 text-lg">Organize your study topics for each subject.</p>
                </div>

                {/* Add/Edit Form */}
                <div className="card p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">{editingId ? 'Edit Topic' : 'Add a New Topic'}</h2>
                    {(isError || formError) && <p className="text-red-500 mb-4">{formError || message}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">Subject</label>
                                <select name="subject" value={form.subject} onChange={handleChange} className="input-field" required>
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map((subj) => (
                                        <option key={subj._id} value={subj._id}>{subj.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Topic Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" required placeholder="e.g., Chapter 1: The Basics" />
                            </div>
                            <div>
                                <label className="form-label">Status</label>
                                <select name="status" value={form.status} onChange={handleChange} className="input-field">
                                    <option value="new">New</option>
                                    <option value="learning">Learning</option>
                                    <option value="revised">Revised</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Difficulty</label>
                                <select name="difficulty" value={form.difficulty} onChange={handleChange} className="input-field">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                            {editingId && (
                                <button type="button" onClick={handleReset} className="btn-secondary">
                                    Cancel
                                </button>
                            )}
                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : (editingId ? 'Update Topic' : 'Add Topic')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Topics List */}
                {isLoading && topics.length === 0 ? (
                    <div className="text-center text-gray-600">Loading topics...</div>
                ) : topics.length === 0 ? (
                    <div className="card p-8 text-center">
                        <h3 className="text-xl font-semibold">No Topics Yet</h3>
                        <p className="text-gray-600 mt-2">Add your first topic using the form above.</p>
                    </div>
                ) : (
                    <div className="card p-8">
                        <div className="space-y-4">
                            {topics.map((topic) => (
                                <div key={topic._id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex-1 mb-4 md:mb-0 mr-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xl font-bold text-gray-900">{topic.name}</h4>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(topic.status)}`}>
                                                    {topic.status}
                                                </span>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                                                    {topic.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 mb-4">{topic.subject?.name || 'N/A'}</p>

                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${calculateProgress(topic) === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                                style={{ width: `${calculateProgress(topic)}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-right">
                                            <span className="text-xs font-bold text-gray-500">{calculateProgress(topic)}% Completed</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 pt-4 md:pt-0 md:border-l md:border-gray-100 md:pl-6">
                                        <button
                                            onClick={() => handleReview(topic._id)}
                                            disabled={isReviewing === topic._id}
                                            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {isReviewing === topic._id ? 'Saving...' : 'Review'}
                                        </button>
                                        <button onClick={() => handleEdit(topic)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button onClick={() => handleDelete(topic._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topics;
