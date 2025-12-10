import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getTopic, generateRoadmap, reset, fetchStepResources } from '../features/study/studySlice';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ResourcesModal from '../components/ResourcesModal';

const StudySession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeStep, setActiveStep] = useState('');
    const [stepResources, setStepResources] = useState([]);
    const [isLoadingResources, setIsLoadingResources] = useState(false);

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

    const handleStartStep = async (stepTitle) => {
        setActiveStep(stepTitle);
        setIsModalOpen(true);
        setIsLoadingResources(true);
        setStepResources([]);

        try {
            const result = await dispatch(fetchStepResources({ id, stepTitle })).unwrap();
            setStepResources(result);
        } catch (error) {
            console.error("Failed to fetch resources:", error);
            toast.error('Failed to fetch resources for this step.');
        } finally {
            setIsLoadingResources(false);
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
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline cursor-pointer">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentTopic) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <ResourcesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                resources={stepResources}
                isLoading={isLoadingResources}
                stepTitle={activeStep}
            />

            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700 cursor-pointer">
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
                                className="w-full btn-primary py-3 flex items-center justify-center space-x-2 cursor-pointer"
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
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Your Journey</h2>
                                <p className="text-gray-500 mt-1">Follow the path to master {currentTopic.name}</p>
                            </div>
                            <div className="bg-blue-100 px-4 py-2 rounded-full text-blue-700 font-semibold text-sm">
                                {currentTopic.roadmap.length} Steps
                            </div>
                        </div>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-8 top-4 bottom-4 w-1 bg-gradient-to-b from-blue-200 to-purple-200 rounded-full hidden md:block"></div>

                            <div className="space-y-8">
                                {currentTopic.roadmap.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.15 }}
                                        className="relative flex items-start group"
                                    >
                                        {/* Connector Circle */}
                                        <div className="absolute left-8 -translate-x-1/2 mt-6 hidden md:flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-white border-4 border-blue-500 z-10 shadow-md group-hover:scale-110 transition-transform duration-300"></div>
                                        </div>

                                        {/* Content Card */}
                                        <div className="ml-0 md:ml-20 w-full">
                                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
                                                {/* Decorative background element */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

                                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                                                                {index + 1}
                                                            </span>
                                                            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                                        </div>
                                                        <p className="text-gray-600 leading-relaxed ml-11">{step.description}</p>
                                                    </div>

                                                    <button
                                                        className="md:self-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px] cursor-pointer"
                                                        onClick={() => handleStartStep(step.title)}
                                                    >
                                                        <span>Start</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Finish Line */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: currentTopic.roadmap.length * 0.15 + 0.5 }}
                                className="mt-12 text-center"
                            >
                                <div className="inline-block p-4 rounded-full bg-green-50 text-green-600 mb-2">
                                    <span className="text-4xl">🏆</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Completion Goal</h3>
                                <p className="text-gray-500 text-sm">Finish all steps to master this topic!</p>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudySession;
