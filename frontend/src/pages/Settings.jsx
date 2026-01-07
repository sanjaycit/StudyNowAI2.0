import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    updateProfile,
    updatePreferences,
    reset,
    updateEmailSettings,
    testEmail,
    sendImmediateReminder
} from '../features/auth/authSlice';

const Settings = () => {
    const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState('');

    // Set initial state from user object once it's loaded
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPreferences({
                dailyStudyGoal: user.preferences?.dailyStudyGoal || '1 hour',
                reminderTime: user.preferences?.reminderTime || '09:00',
                topicPriorityWeight: user.preferences?.topicPriorityWeight || 'Balanced',
                reviewFrequency: user.preferences?.reviewFrequency || 'Standard'
            });
        }
    }, [user]);

    const [preferences, setPreferences] = useState({
        dailyStudyGoal: '1 hour',
        reminderTime: '09:00',
        topicPriorityWeight: 'Balanced',
        reviewFrequency: 'Standard'
    });

    // DAACS State
    const [daacs, setDaacs] = useState({
        alpha: 1.0,
        beta: 0.5,
        phi: 0.1,
        dailyCapacity: 2.0
    });

    useEffect(() => {
        if (user && user.daacs) {
            setDaacs({
                alpha: user.daacs.alpha || 1.0,
                beta: user.daacs.beta || 0.5,
                phi: user.daacs.phi || 0.1,
                dailyCapacity: 2.0 // This field isn't in user model yet but we can mock or add preference later
            });
        }
    }, [user]);

    const tabs = [
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'learner', name: 'Learner Profile (DAACS)', icon: '🧠' },
        { id: 'notifications', name: 'Email Notifications', icon: '📧' },
        { id: 'preferences', name: 'Preferences', icon: '⚙️' },
        { id: 'about', name: 'About', icon: 'ℹ️' }
    ];

    // Reset success/error state on component unmount
    useEffect(() => {
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);


    const handleProfileUpdate = (e) => {
        e.preventDefault();
        dispatch(updateProfile({ name }));
    };

    const handleDaacsUpdate = (e) => {
        e.preventDefault();
        // Pack it into updateProfile call
        dispatch(updateProfile({ name, daacs }));
    };

    const handlePreferencesUpdate = (e) => {
        e.preventDefault();
        dispatch(updatePreferences(preferences));
    };

    const handlePreferenceChange = (field, value) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };

    const handleEmailToggle = () => {
        dispatch(updateEmailSettings({ emailNotificationsEnabled: !user.emailNotificationsEnabled }));
    };

    return (
        <div className="gradient-bg min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Settings ⚙️
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Manage your account preferences and email notifications
                    </p>
                </div>

                {user && (
                    <>
                        {/* User Info Card */}
                        <div className="card p-6 mb-8">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="ml-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {user.name || 'User'}
                                    </h2>
                                    <p className="text-gray-600">{user.email}</p>
                                    <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mb-8">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="mr-2">{tab.icon}</span>
                                            {tab.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="card">
                            {activeTab === 'profile' && (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Display Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter your display name"
                                                minLength={2}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="btn-primary"
                                            >
                                                {isLoading ? 'Updating...' : 'Update Profile'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'learner' && (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">DAACS Learner Profile</h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Configure your personalized learning parameters for the Adaptive Scheduler.
                                    </p>

                                    <form onSubmit={handleDaacsUpdate} className="space-y-6">
                                        {/* Alpha (Learning Rate) */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-medium text-gray-700">Learning Rate (α)</label>
                                                <span className="text-sm text-blue-600 font-bold">{daacs.alpha}x</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="3.0" step="0.1"
                                                value={daacs.alpha}
                                                onChange={(e) => setDaacs({ ...daacs, alpha: parseFloat(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Multiplier for learning speed. Higher is faster.</p>
                                        </div>

                                        {/* Beta (Retention Rate) */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-medium text-gray-700">Retention Rate (β)</label>
                                                <span className="text-sm text-blue-600 font-bold">{daacs.beta}</span>
                                            </div>
                                            <input
                                                type="range" min="0.1" max="1.0" step="0.05"
                                                value={daacs.beta}
                                                onChange={(e) => setDaacs({ ...daacs, beta: parseFloat(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Probability of retaining info week-to-week.</p>
                                        </div>

                                        {/* Phi (Consistency) */}
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-medium text-gray-700">Consistency (φ)</label>
                                                <span className="text-sm text-blue-600 font-bold">{daacs.phi}</span>
                                            </div>
                                            <input
                                                type="range" min="0.0" max="1.0" step="0.05"
                                                value={daacs.phi}
                                                onChange={(e) => setDaacs({ ...daacs, phi: parseFloat(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Variance in daily performance (Noise factor).</p>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="btn-primary"
                                            >
                                                {isLoading ? 'Saving Parameters...' : 'Save Learner Profile'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="p-6">
                                    <div className="flex items-center mb-6">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                                            <span className="text-2xl">📧</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                                            <p className="text-sm text-gray-600">Manage your study reminders and email alerts</p>
                                        </div>
                                    </div>

                                    {/* Email Notifications Toggle */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Enable Email Notifications</p>
                                                <p className="text-xs text-gray-600">
                                                    Master switch for all email notifications.
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleEmailToggle}
                                                disabled={isLoading}
                                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${user.emailNotificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${user.emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`transition-opacity duration-300 ${!user.emailNotificationsEnabled && 'opacity-50 pointer-events-none'}`}>
                                        {/* Test Email Buttons */}
                                        <div className="mb-6">
                                            <h4 className="text-md font-medium text-gray-900 mb-3">Test Emails</h4>
                                            <div className="space-y-3">
                                                <button onClick={() => dispatch(testEmail('study'))} disabled={isLoading} className="btn-secondary">Test Study Reminder</button>
                                                <button onClick={() => dispatch(testEmail('exam'))} disabled={isLoading} className="btn-secondary ml-2">Test Exam Reminder</button>
                                            </div>
                                        </div>

                                        {/* Manual Reminder */}
                                        <div className="mb-6">
                                            <h4 className="text-md font-medium text-gray-900 mb-3">Manual Reminder</h4>
                                            <button onClick={() => dispatch(sendImmediateReminder())} disabled={isLoading} className="btn-primary">Send Reminder Now</button>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Preferences</h3>

                                    <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                                        <div>
                                            <h4 className="text-md font-medium text-gray-900 mb-3">Study Schedule</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Daily Study Goal</p>
                                                        <p className="text-xs text-gray-600">Set your daily study target</p>
                                                    </div>
                                                    <select
                                                        value={preferences.dailyStudyGoal}
                                                        onChange={(e) => handlePreferenceChange('dailyStudyGoal', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="30 minutes">30 minutes</option>
                                                        <option value="1 hour">1 hour</option>
                                                        <option value="2 hours">2 hours</option>
                                                        <option value="3 hours">3 hours</option>
                                                        <option value="4+ hours">4+ hours</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Study Reminder Time</p>
                                                        <p className="text-xs text-gray-600">When to receive daily reminders</p>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        value={preferences.reminderTime}
                                                        onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-md font-medium text-gray-900 mb-3">AI Preferences</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Topic Priority Weight</p>
                                                        <p className="text-xs text-gray-600">How much to prioritize difficult topics</p>
                                                    </div>
                                                    <select
                                                        value={preferences.topicPriorityWeight}
                                                        onChange={(e) => handlePreferenceChange('topicPriorityWeight', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="Balanced">Balanced</option>
                                                        <option value="Focus on Hard Topics">Focus on Hard Topics</option>
                                                        <option value="Focus on Easy Topics">Focus on Easy Topics</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Review Frequency</p>
                                                        <p className="text-xs text-gray-600">How often to review topics</p>
                                                    </div>
                                                    <select
                                                        value={preferences.reviewFrequency}
                                                        onChange={(e) => handlePreferenceChange('reviewFrequency', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="Standard">Standard</option>
                                                        <option value="Frequent">Frequent</option>
                                                        <option value="Intensive">Intensive</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="btn-primary"
                                            >
                                                {isLoading ? 'Saving...' : 'Save Preferences'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'about' && (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About StudyNow AI</h3>
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="text-md font-medium text-blue-900 mb-2">Version</h4>
                                            <p className="text-blue-700">StudyNow AI v1.0.0</p>
                                        </div>

                                        <div>
                                            <h4 className="text-md font-medium text-gray-900 mb-2">Features</h4>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li>• AI-powered study scheduling</li>
                                                <li>• Spaced repetition algorithm</li>
                                                <li>• Smart topic prioritization</li>
                                                <li>• Email notifications</li>
                                                <li>• Progress tracking and analytics</li>
                                                <li>• Exam countdown reminders</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-md font-medium text-gray-900 mb-2">Technology Stack</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div>Frontend: React + Redux + Tailwind</div>
                                                <div>Backend: Node.js + Express + MongoDB</div>
                                                <div>AI: Custom prioritization algorithm</div>
                                                <div>Notifications: Nodemailer</div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <a
                                                href="https://github.com/your-repo/studynow-ai"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary"
                                            >
                                                View Source Code
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Settings; 