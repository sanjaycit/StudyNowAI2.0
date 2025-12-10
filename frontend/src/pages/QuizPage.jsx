import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTopicQuiz, submitTopicQuiz, getStepQuiz, submitStepQuiz, reset } from '../features/study/studySlice';
import { toast } from 'react-hot-toast';

const QuizPage = () => {
    const { id, stepIndex } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { quiz, quizResult, isQuizLoading, isError, message } = useSelector((state) => state.study);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        dispatch(reset());
        if (stepIndex !== undefined) {
            dispatch(getStepQuiz({ id, stepIndex }));
        } else {
            dispatch(getTopicQuiz(id));
        }
    }, [dispatch, id, stepIndex]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
    }, [isError, message]);

    const handleOptionSelect = (index) => {
        setSelectedOption(index);
    };

    const handleNext = () => {
        // Save answer
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOption }));
        setSelectedOption(null);

        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmitQuiz();
        }
    };

    const handleSubmitQuiz = () => {
        // Collect all answers
        const finalAnswers = [];
        // Ensure we have answers for all questions, even if skipped (undefined)
        // Though UI enforcement prevents skipping currently
        // But we construct array matching quiz indices
        for (let i = 0; i < quiz.length; i++) {
            // If answer key exists, use it. But wait, handleNext saves before increment.
            // For the last question, handleNext calls handleSubmitQuiz AFTER saving.
            // Wait, logic above:
            // setAnswers is async. Correct way: pass current selection to submit logic if it's the last one.
            // Actually, handleNext updates state, but state update triggers re-render, NOT immediate availability in function scope.
            // Better to pass the last answer directly or handle 'Finish' button separately.
        }

        // Revised Logic:
        // Use a "Finish" button for the last question.
        // Update state, then locally construct the payload.

        // Let's refine handling.
    };

    // Better logic for navigation and state
    const handleNextQuestion = () => {
        setAnswers({ ...answers, [currentQuestionIndex]: selectedOption });
        setSelectedOption(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleFinish = async () => {
        const finalAnswersMap = { ...answers, [currentQuestionIndex]: selectedOption };
        const answersArray = quiz.map((_, index) => finalAnswersMap[index] ?? -1); // -1 for unanswered

        if (stepIndex !== undefined) {
            await dispatch(submitStepQuiz({ id, stepIndex, answers: answersArray }));
        } else {
            await dispatch(submitTopicQuiz({ id, answers: answersArray }));
        }
    };

    if (isQuizLoading) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">Loading Quiz... This might take a moment if specific AI generation is needed.</div>
            </div>
        );
    }

    if (quizResult) {
        return (
            <div className="min-h-screen gradient-bg p-8 flex items-center justify-center">
                <div className="card max-w-2xl w-full p-8 text-center animate-fade-in">
                    <h2 className="text-4xl font-bold mb-6 text-gray-800">Quiz Completed! 🎉</h2>

                    <div className="mb-8">
                        <div className="text-6xl font-extrabold text-indigo-600 mb-2">{Math.round(quizResult.percentage)}%</div>
                        <p className="text-xl text-gray-600">Score: {quizResult.score} / {quizResult.total}</p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl mb-8 text-left">
                        <h3 className="text-lg font-bold text-blue-800 mb-2">Areas to Improve:</h3>
                        <p className="text-blue-700">{quizResult.areasToImprove}</p>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <button onClick={() => stepIndex ? navigate(`/study/${id}`) : navigate('/topics')} className="btn-primary">
                            {stepIndex ? 'Back to Journey' : 'Back to Topics'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz || quiz.length === 0) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <div className="text-white text-xl">No quiz available or failed to load.</div>
            </div>
        );
    }

    const currentQuestion = quiz[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.length - 1;

    // Determine current section (Easy, Medium, Hard)
    // Assuming 5 each. 0-4 Easy, 5-9 Medium, 10-14 Hard. 
    // Or simpler: use currentQuestion.difficulty if available.
    const difficultyColor =
        currentQuestion.difficulty === 'easy' ? 'text-green-500' :
            currentQuestion.difficulty === 'medium' ? 'text-yellow-500' :
                'text-red-500';

    return (
        <div className="min-h-screen gradient-bg p-4 md:p-8 flex items-center justify-center">
            <div className="card max-w-3xl w-full p-6 md:p-10 relative">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 rounded-t-xl overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
                    ></div>
                </div>

                <div className="mt-4 mb-8 flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
                    <span className={`capitalize ${difficultyColor} font-bold`}>{currentQuestion.difficulty} Level</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                    {currentQuestion.question}
                </h2>

                <div className="space-y-4 mb-10">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 
                                ${selectedOption === index
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md transform scale-[1.01]'
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                                }
                            `}
                        >
                            <span className="inline-block w-8 h-8 text-center leading-8 rounded-full bg-white border border-gray-300 mr-4 font-bold text-gray-500 text-sm">
                                {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={isLastQuestion ? handleFinish : handleNextQuestion}
                        disabled={selectedOption === null}
                        className={`btn-primary px-8 py-3 text-lg shadow-lg flex items-center space-x-2
                            ${selectedOption === null ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                        `}
                    >
                        <span>{isLastQuestion ? 'Submit Quiz' : 'Next Question'}</span>
                        {!isLastQuestion && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default QuizPage;
