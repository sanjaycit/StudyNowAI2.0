import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchStepResources } from '../features/study/studySlice';
import { motion } from 'framer-motion';

const StudyResources = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const stepTitle = searchParams.get('step');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id || !stepTitle) {
            navigate('/dashboard');
            return;
        }

        const loadResources = async () => {
            setIsLoading(true);
            try {
                const result = await dispatch(fetchStepResources({ id, stepTitle })).unwrap();
                setResources(result);
            } catch (error) {
                console.error("Failed to load resources:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadResources();
    }, [dispatch, id, stepTitle, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Roadmap
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Curated Resources</h1>
                    <p className="text-gray-600">
                        Hand-picked learning materials for <span className="font-semibold text-blue-600">"{stepTitle}"</span>
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-800 animate-pulse">AI is curating the best content...</h3>
                        <p className="text-gray-500 mt-2">Scanning articles, videos, and documentation</p>
                    </div>
                ) : resources.length > 0 ? (
                    <div className="space-y-6">
                        {resources.map((resource, index) => (
                            <motion.a
                                href={resource.url || `https://www.google.com/search?q=${encodeURIComponent(resource.title + ' ' + resource.type)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="block bg- white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group relative overflow-hidden bg-white"
                            >
                                <div className="absolute top-0 right-0 p-3">
                                    <span
                                        className={`text-sm font-bold px-3 py-1 rounded-full ${resource.relevance >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {resource.relevance}% Match
                                    </span>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-xl flex-shrink-0 ${resource.type?.toLowerCase().includes('video') ? 'bg-red-100 text-red-600' :
                                            resource.type?.toLowerCase().includes('doc') ? 'bg-green-100 text-green-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        {resource.type?.toLowerCase().includes('video') ? (
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        ) : (
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                                        )}
                                    </div>

                                    <div className="flex-1 pr-16">
                                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                            {resource.title}
                                        </h4>
                                        <p className="text-gray-600 mb-3 leading-relaxed">
                                            <span className="font-semibold text-gray-800">{resource.type}</span> • {resource.description}
                                        </p>
                                        <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                                            Visit Resource
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900">No resources found</h3>
                        <p className="text-gray-500 mt-2">We couldn't generate resources for this step. Try again or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyResources;
