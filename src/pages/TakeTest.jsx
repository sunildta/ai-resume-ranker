import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function TakeTest() {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/test/${testId}`);
                setTest(response.data);
                // Initialize answers array with empty strings
                setAnswers(new Array(response.data.questions.length).fill(""));
            } catch (err) {
                console.error("Error fetching test:", err);
                setError("Failed to load test. Please check the link and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    const handleAnswerChange = (questionIndex, answer) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        // Check if all questions are answered
        if (answers.some(answer => !answer)) {
            alert("Please answer all questions before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(
                `http://localhost:8000/api/test/submit/${testId}`,
                {
                    candidate_id: test.candidate_id,
                    candidate_name: test.candidate_name,
                    candidate_email: test.candidate_email,
                    answers: answers
                }
            );

            // Show result and navigate back
            alert(`Test Submitted Successfully!\n\nScore: ${response.data.score}/${response.data.total_questions}\nPercentage: ${response.data.percentage.toFixed(1)}%\nRank: ${response.data.rank || 'N/A'}`);

            navigate("/dashboard/test-results");
        } catch (err) {
            console.error("Error submitting test:", err);
            alert("Failed to submit test. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
                <div className="text-violet-600 font-semibold text-lg animate-pulse">
                    Loading test...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 p-8">
                <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Test</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 mb-8 border border-white/20">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            📝 Aptitude Test
                        </h1>
                        <p className="text-gray-600">
                            Candidate: <span className="font-semibold">{test.candidate_name}</span>
                        </p>
                        <p className="text-gray-500 text-sm">
                            Email: {test.candidate_email}
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-blue-800 font-medium">
                                    Total Questions: {test.questions.length}
                                </span>
                            </div>
                            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-semibold">
                                Difficulty: {test.difficulty}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {test.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20">
                            <div className="flex items-start mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                                    {qIndex + 1}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 flex-1">
                                    {question.question}
                                </h3>
                            </div>

                            <div className="space-y-3 ml-14">
                                {question.options.map((option, oIndex) => {
                                    const optionLetter = option.charAt(0); // A, B, C, or D
                                    const isSelected = answers[qIndex] === optionLetter;

                                    return (
                                        <label
                                            key={oIndex}
                                            className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                                                    ? "bg-violet-100 border-2 border-violet-500"
                                                    : "bg-gray-50 border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                value={optionLetter}
                                                checked={isSelected}
                                                onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                                className="mr-3 w-5 h-5 text-violet-600"
                                            />
                                            <span className={`${isSelected ? "text-violet-700 font-semibold" : "text-gray-700"}`}>
                                                {option}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || answers.some(a => !a)}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                Submitting...
                            </div>
                        ) : (
                            "Submit Test"
                        )}
                    </button>
                    {answers.some(a => !a) && (
                        <p className="text-orange-600 text-sm mt-4">
                            ⚠️ Please answer all questions before submitting
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TakeTest;
