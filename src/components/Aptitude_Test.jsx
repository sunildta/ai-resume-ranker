import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function AptitudeTest() {
  const { testId } = useParams();
  const [testDetails, setTestDetails] = useState(null);
  const [answers, setAnswers] = useState({});
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/test/${testId}`);
        setTestDetails(response.data);
      } catch (err) {
        console.error("Error fetching test details:", err);
        setError("Failed to load test questions. Please check the test link.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestQuestions();
  }, [testId]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmissionStatus(null);

    if (!candidateName || !candidateEmail) {
      setError("Please enter your name and email.");
      setIsSubmitting(false);
      return;
    }

    if (Object.keys(answers).length !== testDetails.questions.length) {
      setError("Please answer all questions before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionUrl = `http://localhost:8000/api/test/submit/${testId}`;
      const response = await axios.post(submissionUrl, {
        candidate_id: candidateEmail,   // using email as unique ID
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        answers: Object.values(answers)
      });
      setSubmissionStatus(response.data.message || "Test submitted successfully!");
    } catch (err) {
      console.error("Error submitting test:", err);
      setError("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center mt-20">Loading test...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;
  if (!testDetails) return <div className="text-center mt-20 text-gray-500">Test not found.</div>;

  if (submissionStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Success!</h2>
          <p className="text-lg text-gray-700">{submissionStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Aptitude Test</h1>
        <form onSubmit={handleSubmit}>
          
          {/* Candidate Details */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-violet-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-violet-500"
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Questions */}
          <ol className="space-y-8">
            {testDetails.questions.map((q, qIndex) => (
              <li key={qIndex} className="p-6 border rounded-lg bg-gray-100 shadow-sm">
                <p className="font-semibold text-lg text-gray-800 mb-4">{q.question}</p>
                <div className="space-y-3">
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center">
                      <input
                        type="radio"
                        id={`q${qIndex}-o${oIndex}`}
                        name={`question-${qIndex}`}
                        value={option}
                        onChange={() => handleAnswerChange(qIndex, option)}
                        checked={answers[qIndex] === option}
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor={`q${qIndex}-o${oIndex}`} className="ml-3 text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {/* Submit */}
          <div className="text-center mt-10">
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(answers).length !== testDetails.questions.length}
              className="bg-violet-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-violet-700 transition disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AptitudeTest;
