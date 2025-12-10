import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResourcesModal = ({ isOpen, onClose, resources, isLoading, stepTitle }) => {
    const modalRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    ref={modalRef}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Recommended Resources</h3>
                            <p className="text-sm text-gray-600 mt-1">picked for: <span className="font-semibold text-blue-700">{stepTitle}</span></p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/50 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                <p className="text-gray-500 animate-pulse">AI is curating the best links for you...</p>
                            </div>
                        ) : resources && resources.length > 0 ? (
                            <div className="space-y-4">
                                {resources.map((resource, index) => (
                                    <motion.a
                                        href={resource.url || `https://www.google.com/search?q=${encodeURIComponent(resource.title + ' ' + resource.type)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="block bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2">
                                            <span
                                                className={`text-xs font-bold px-2 py-1 rounded-full ${resource.relevance >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {resource.relevance}% Match
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg flex-shrink-0 ${resource.type?.toLowerCase().includes('video') ? 'bg-red-100 text-red-600' :
                                                    resource.type?.toLowerCase().includes('doc') ? 'bg-green-100 text-green-600' :
                                                        'bg-blue-100 text-blue-600'
                                                }`}>
                                                {resource.type?.toLowerCase().includes('video') ? (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                                                )}
                                            </div>

                                            <div className="flex-1 pr-16">
                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{resource.title}</h4>
                                                <p className="text-sm text-gray-500 mb-2">{resource.type} • {resource.description}</p>
                                                <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                                                    Visit Resource
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                </span>
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>No specific resources found. Try searching manually.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResourcesModal;
