import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';

const ProctorMonitor = ({ onViolation, isActive }) => {
    const [cameraPermission, setCameraPermission] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [violations, setViolations] = useState([]);
    const [faceDetected, setFaceDetected] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const faceCheckInterval = useRef(null);
    const noFaceStartTime = useRef(null);

    const isMounted = useRef(false);

    // Initialize camera
    useEffect(() => {
        isMounted.current = true;
        if (isActive) {
            initializeCamera();
            requestFullscreen();
            addEventListeners();
        }

        return () => {
            isMounted.current = false;
            cleanup();
        };
    }, [isActive]);

    const initializeCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            // CRITICAL: Check if mounted and ref exists before using
            if (isMounted.current && videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraPermission(true);
                toast.success('Camera enabled for proctoring');

                videoRef.current.onloadedmetadata = () => {
                    if (isMounted.current) {
                        startFaceDetection();
                    }
                };
            } else {
                // If unmounted, stop immediately
                stream.getTracks().forEach(track => track.stop());
            }
        } catch (error) {
            if (!isMounted.current) return;
            console.error('Camera access denied:', error);
            setCameraPermission(false);
            toast.error('Camera access is required for this quiz');
            logViolation('Camera access denied');
        }
    };

    const startFaceDetection = () => {
        // Simple face detection using canvas pixel analysis
        // For more advanced detection, integrate face-api.js or similar
        faceCheckInterval.current = setInterval(() => {
            try {
                if (videoRef.current && canvasRef.current) {
                    // Safety check: ensure video has dimensions
                    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                        return;
                    }

                    const detected = checkForFace();
                    setFaceDetected(detected);

                    if (!detected) {
                        if (!noFaceStartTime.current) {
                            noFaceStartTime.current = Date.now();
                        } else {
                            const elapsed = Date.now() - noFaceStartTime.current;
                            if (elapsed > 5000) { // 5 seconds without face
                                logViolation('No face detected for 5+ seconds');
                                toast.error('Please remain in front of the camera');
                            }
                        }
                    } else {
                        noFaceStartTime.current = null;
                    }
                }
            } catch (err) {
                // Silently catch video/canvas errors during resize/fullscreen transition
                // This prevents the "white screen" crash if the video element is momentarily unavailable
                console.warn("Face detection interval error:", err);
            }
        }, 2000); // Check every 2 seconds
    };

    const checkForFace = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return false;

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simple brightness check - if there's significant variation, likely a face
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let totalBrightness = 0;
        const sampleSize = 1000;

        for (let i = 0; i < sampleSize; i++) {
            const idx = Math.floor(Math.random() * pixels.length / 4) * 4;
            const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            totalBrightness += brightness;
        }

        const avgBrightness = totalBrightness / sampleSize;

        // If average brightness is between reasonable values, assume face present
        return avgBrightness > 30 && avgBrightness < 240;
    };

    const requestFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error('Fullscreen request failed:', err);
                toast.error('Please enable fullscreen mode');
            });
        }
    };

    const addEventListeners = () => {
        // Fullscreen change detection
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);

        // Tab visibility detection
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Window blur detection (switching to another app)
        window.addEventListener('blur', handleWindowBlur);

        // Prevent right-click
        document.addEventListener('contextmenu', preventContextMenu);

        // Prevent certain keyboard shortcuts
        document.addEventListener('keydown', handleKeyDown);

        // Prevent copy
        document.addEventListener('copy', preventCopy);
    };

    const handleFullscreenChange = () => {
        const isFs = !!(document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement);
        setIsFullscreen(isFs);

        if (!isFs) {
            logViolation('Exited fullscreen mode');
            toast.error('Please return to fullscreen mode');
            // Do not auto-request fullscreen - it fails without user gesture
        }
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            logViolation('Tab switched or minimized');
            toast.error('Tab switching detected!');
        }
    };

    const handleWindowBlur = () => {
        logViolation('Window lost focus');
        toast('Please stay focused on the quiz', { icon: '⚠️' });
    };

    const preventContextMenu = (e) => {
        e.preventDefault();
        toast.error('Right-click is disabled during quiz');
    };

    const handleKeyDown = (e) => {
        // Prevent common screenshot shortcuts
        if (
            (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'I')) || // Chrome DevTools
            (e.key === 'PrintScreen') || // Print Screen
            (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) || // Mac screenshot
            (e.ctrlKey && e.key === 'p') // Print
        ) {
            e.preventDefault();
            logViolation('Attempted screenshot or print');
            toast.error('Screenshots are not allowed');
        }

        // Prevent Alt+Tab (not fully preventable but we can detect)
        if (e.altKey && e.key === 'Tab') {
            logViolation('Alt+Tab detected');
        }
    };

    const preventCopy = (e) => {
        e.preventDefault();
        toast.error('Copying is disabled during quiz');
    };

    const logViolation = (type) => {
        const violation = {
            type,
            timestamp: new Date().toISOString(),
        };

        console.log(`📝 Violation logged: ${type}`);

        // Use functional update to ensure we always have the latest violation count
        setViolations(prevViolations => {
            const newViolations = [...prevViolations, violation];
            console.log(`Total violations: ${newViolations.length}`);

            // Check if max violations exceeded
            if (newViolations.length >= 2) {
                console.log('🚨 MAX VIOLATIONS REACHED! Terminating quiz...');
                toast.error('Maximum violations reached! Quiz will be terminated.', { duration: 5000 });

                // Trigger termination callback after a short delay
                setTimeout(() => {
                    if (onViolation) {
                        onViolation({ ...violation, terminate: true, totalViolations: newViolations.length });
                    }
                }, 2000);
            } else {
                // Normal violation logging
                if (onViolation) {
                    onViolation(violation);
                }

                // Show warning about remaining chances
                const remaining = 2 - newViolations.length;
                toast(`⚠️ Warning ${newViolations.length}/2 - ${remaining} warning(s) remaining before termination!`, {
                    duration: 4000,
                    icon: '⚠️'
                });
            }

            return newViolations;
        });
    };

    const cleanup = () => {
        // Stop camera
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Clear intervals
        if (faceCheckInterval.current) {
            clearInterval(faceCheckInterval.current);
        }

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        // Remove event listeners
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('copy', preventCopy);
    };

    if (!isActive) return null;

    return (
        <>
            {/* Fullscreen Prompt Overlay - using Portal to avoid stacking context issues */}
            {!isFullscreen && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(5, 5, 5, 0.96)', /* Force dark background */
                        zIndex: 2147483647 /* Max safe integer for z-index */
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 relative">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Fullscreen Required!</h3>
                            <p className="text-gray-600 mb-6">This quiz requires fullscreen mode for proctoring. Please click below to continue.</p>
                            <button
                                onClick={requestFullscreen}
                                className="btn-primary px-8 py-4 text-lg font-bold flex items-center justify-center mx-auto space-x-2 transform hover:scale-105 transition-transform"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <span>Enter Fullscreen Mode</span>
                            </button>
                            <p className="text-xs text-gray-500 mt-4">
                                ⚠️ Exiting fullscreen counts as a violation
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className={`fixed top-4 right-4 z-50 ${!isFullscreen ? 'invisible opacity-0' : 'visible opacity-100'} transition-opacity duration-200`}>
                {/* Camera Preview */}
                <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-indigo-500">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 flex items-center justify-between">
                        <span className="text-white font-semibold text-sm flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            Proctoring Active
                        </span>
                        <div className="flex items-center space-x-2">
                            {/* Camera Status */}
                            <div className={`w-2 h-2 rounded-full ${cameraPermission ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />

                            {/* Face Detection Status */}
                            {cameraPermission && (
                                <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-64 h-48 object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Overlay indicators */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${faceDetected
                                ? 'bg-green-500 text-white'
                                : 'bg-yellow-500 text-gray-900'
                                }`}>
                                {faceDetected ? '✓ Face Detected' : '! No Face'}
                            </div>

                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isFullscreen
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                                }`}>
                                {isFullscreen ? '✓ Fullscreen' : '! Exit FS'}
                            </div>
                        </div>
                    </div>

                    {/* Violation Counter */}
                    {violations.length > 0 && (
                        <div className={`px-4 py-2 text-white text-sm font-semibold text-center ${violations.length >= 2 ? 'bg-red-600 animate-pulse' : 'bg-yellow-500'
                            }`}>
                            ⚠️ Warning {violations.length}/2 {violations.length >= 2 ? '- TERMINATING!' : `- ${2 - violations.length} left`}
                        </div>
                    )}
                </div>

                {/* Violations List (Expandable) */}
                {violations.length > 0 && (
                    <div className="mt-2 bg-white rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto border border-red-300">
                        <h4 className="text-xs font-bold text-red-600 mb-2">Recent Violations:</h4>
                        <ul className="space-y-1">
                            {violations.slice(-5).reverse().map((v, idx) => (
                                <li key={idx} className="text-xs text-gray-700 flex items-start">
                                    <span className="text-red-500 mr-1">•</span>
                                    <span className="flex-1">{v.type}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProctorMonitor;
