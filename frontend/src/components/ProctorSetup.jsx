import { useState } from 'react';

const ProctorSetup = ({ onAccept, onDecline }) => {
    const [accepted, setAccepted] = useState(false);
    const [cameraTest, setCameraTest] = useState(null);

    const testCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraTest(true);
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            setCameraTest(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg p-4 md:p-8 flex items-center justify-center">
            <div className="card max-w-3xl w-full p-8 animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Proctoring Setup</h2>
                    <p className="text-gray-600">This quiz requires proctoring to ensure academic integrity</p>
                </div>

                {/* Proctoring Features */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Proctoring Features:</h3>
                    <div className="space-y-3">
                        <div className="flex items-start p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900">Camera Monitoring</h4>
                                <p className="text-sm text-blue-700">Your webcam will record you during the quiz</p>
                            </div>
                        </div>

                        <div className="flex items-start p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-900">Fullscreen Mode</h4>
                                <p className="text-sm text-purple-700">You must remain in fullscreen throughout the quiz</p>
                            </div>
                        </div>

                        <div className="flex items-start p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-900">Tab Switching Detection</h4>
                                <p className="text-sm text-green-700">Leaving this tab will be flagged as a violation</p>
                            </div>
                        </div>

                        <div className="flex items-start p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-yellow-900">Face Detection</h4>
                                <p className="text-sm text-yellow-700">The system will verify your presence throughout the quiz</p>
                            </div>
                        </div>

                        <div className="flex items-start p-4 bg-red-50 rounded-xl border border-red-200">
                            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-900">Screenshot Prevention</h4>
                                <p className="text-sm text-red-700">Screenshots and right-click are disabled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Camera Test */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Camera Test</h3>
                    <p className="text-sm text-gray-600 mb-4">Please test your camera before starting the quiz</p>
                    <button
                        onClick={testCamera}
                        className="btn-secondary"
                    >
                        Test Camera
                    </button>
                    {cameraTest !== null && (
                        <div className={`mt-3 p-3 rounded-lg ${cameraTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {cameraTest ? (
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                    </svg>
                                    Camera is working properly
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                    </svg>
                                    Camera access denied. Please allow camera access.
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Consent */}
                <div className="mb-8">
                    <label className="flex items-start cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                            I understand and accept the proctoring requirements. I consent to being monitored via webcam and having my quiz activity tracked. I understand that any violations may affect my quiz results.
                        </span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={onDecline}
                        className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAccept}
                        disabled={!accepted || cameraTest !== true}
                        className={`btn-primary px-8 py-3 text-lg flex items-center space-x-2 ${(!accepted || cameraTest !== true) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                            }`}
                    >
                        <span>Start Proctored Quiz</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                    <div className="flex">
                        <svg className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                        </svg>
                        <p className="text-sm text-amber-800">
                            <strong>Important:</strong> Ensure you're in a quiet, well-lit environment with a stable internet connection. <strong className="text-red-700">Maximum 2 violations allowed - quiz will automatically terminate after 2nd violation!</strong>
                        </p>
                    </div>
                </div>

                {/* Additional Critical Warning */}
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
                    <div className="flex">
                        <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                        </svg>
                        <div>
                            <p className="text-sm font-bold text-red-900 mb-1">⚠️ Two-Strike Policy</p>
                            <ul className="text-xs text-red-800 space-y-1">
                                <li>• <strong>1st violation:</strong> Warning - 1 chance remaining</li>
                                <li>• <strong>2nd violation:</strong> Quiz automatically terminated</li>
                                <li>• No exceptions - maintain proper exam conditions at all times</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProctorSetup;
