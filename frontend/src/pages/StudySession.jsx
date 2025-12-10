import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getTopic, generateRoadmap, reset } from '../features/study/studySlice';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const StudySession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentTopic, isLoading, isError, message } = useSelector((state) => state.study);

    useEffect(() => {
        dispatch(getTopic(id));
        return () => {
            dispatch(reset());
        };
    }, [dispatch, id]);

    const handleGenerateRoadmap = async () => {
        console.log("Generating roadmap for ID:", id);
        try {
            await dispatch(generateRoadmap(id)).unwrap();
            console.log("Roadmap generation successful");
            toast.success('Study roadmap generated successfully!');
        } catch (error) {
            console.error("Roadmap generation failed:", error);
            toast.error('Failed to generate roadmap: ' + error);
        }
    };

    if (isLoading && !currentTopic) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p className="text-xl font-semibold">Error loading topic</p>
                    <p>{message}</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentTopic) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">{currentTopic.name}</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        {currentTopic.subject?.name} • {currentTopic.difficulty}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {(!currentTopic.roadmap || currentTopic.roadmap.length === 0) ? (
                    <div className="text-center py-20">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md mx-auto">
                            <span className="text-4xl mb-4 block">🗺️</span>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Study Roadmap</h2>
                            <p className="text-gray-600 mb-6">
                                Let AI analyze this topic and create a personalized step-by-step study plan for you.
                            </p>
                            <button
                                onClick={handleGenerateRoadmap}
                                disabled={isLoading}
                                className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Generating Plan...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✨ Generate with AI</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Your Learning Roadmap</h2>
                            <div className="text-sm text-gray-500">
                                {currentTopic.roadmap.length} Steps
                            </div>
                        </div>

                        <div className="space-y-4">
                            {currentTopic.roadmap.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                                            </div>
                                            <p className="text-gray-600 ml-11">{step.description}</p>
                                        </div>
                                        <button
                                            className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                                            onClick={() => toast('Starting study session...', { icon: '🚀' })}
                                        >
                                            Start Study
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudySession;
