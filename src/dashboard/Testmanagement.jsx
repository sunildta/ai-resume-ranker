import { useState, useEffect } from "react";
import { useShortlist } from "../contexts/ShortlistContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function TestManagement() {
  const { jobId: urlJobId } = useParams();
  const { selectedCandidates, currentJobId, currentFilters, setCurrentJobId } = useShortlist();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedTests, setGeneratedTests] = useState({});

  // Use URL param or context jobId
  const activeJobId = urlJobId || currentJobId;

  // Set job ID in context if from URL
  useEffect(() => {
    if (urlJobId && urlJobId !== currentJobId) {
      setCurrentJobId(urlJobId);
    }
  }, [urlJobId, currentJobId, setCurrentJobId]); // { filename: { testId, emailStatus } }

  const handleViewResult = () => {
    navigate(`/dashboard/test-results`);
  };


  const handleGenerateAllTests = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedTests({}); // Clear previous

    try {
      // 🔥 Fetch actual job data from backend
      const jobResponse = await axios.get(`http://localhost:8000/debug/jobs`);
      const jobs = jobResponse.data.jobs;
      const currentJob = jobs.find(j => j.id === activeJobId);

      if (!currentJob) {
        setError("Job not found. Please try again.");
        setIsGenerating(false);
        return;
      }

      // Extract skills from filter or job description
      let skillsArray = [];
      if (currentFilters && currentFilters.requiredSkills) {
        skillsArray = currentFilters.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
      }

      // If no skills in filter, extract from job's required_skills or use a default set
      if (skillsArray.length === 0 && currentJob.required_skills) {
        skillsArray = currentJob.required_skills.split(',').map(s => s.trim()).filter(s => s);
      }

      // Fallback: extract keywords from job description
      if (skillsArray.length === 0 && currentJob.description) {
        const commonSkills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'CSS', 'HTML', 'TypeScript', 'Redux', 'API', 'Git'];
        skillsArray = commonSkills.filter(skill =>
          currentJob.description.toLowerCase().includes(skill.toLowerCase())
        );
      }

      // Final fallback
      if (skillsArray.length === 0) {
        skillsArray = ['Problem Solving', 'Communication', 'Teamwork'];
      }

      const generationPromises = selectedCandidates.map(async (candidate) => {
        try {
          const apiUrl = "http://localhost:8000/api/test/create";

          const payload = {
            job_id: activeJobId,
            candidate_id: candidate.filename || candidate,
            difficulty: difficulty,
            skills: skillsArray, // ✅ Real skills from job
            candidate_name: candidate.name || candidate,
            candidate_email: candidate.email || "test@example.com",
            job_title: currentJob.title // ✅ Real job title
          };

          console.log('🎯 Generating test with:', {
            jobTitle: payload.job_title,
            skills: payload.skills,
            difficulty: payload.difficulty
          });

          const response = await axios.post(apiUrl, payload);

          return {
            filename: candidate.filename || candidate,
            testId: response.data.test_id,
            emailStatus: response.data.email_status
          };
        } catch (err) {
          console.error(`Error generating test for ${candidate}:`, err);
          return { filename: candidate.filename || candidate, error: "Failed to generate" };
        }
      });

      const results = await Promise.all(generationPromises);

      const newGeneratedTests = results.reduce((acc, result) => {
        if (result && result.testId) {
          acc[result.filename] = { testId: result.testId, emailStatus: result.emailStatus };
        }
        return acc;
      }, {});

      setGeneratedTests(newGeneratedTests);
    } catch (err) {
      console.error("Error in test generation:", err);
      setError("Failed to generate tests. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeJobId) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50  bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-12 px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Job Selected</h2>
          <p className="text-gray-600 mb-6">Please go back and select a job.</p>
          <button
            onClick={() => navigate("/dashboard/job-postings")}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition"
          >
            Go to Job Postings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Test Management for Job ID: {activeJobId}
        </h2>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-green-800 font-medium">
              Total Selected Resumes: {selectedCandidates.length}
            </span>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8">
          {selectedCandidates.length === 0 ? (
            <p className="text-center text-gray-600 text-lg font-medium">
              No candidates selected for the test round.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="difficulty-select" className="font-medium text-gray-700">
                  Select Difficulty for all tests:
                </label>
                <select
                  id="difficulty-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button
                  onClick={handleGenerateAllTests}
                  disabled={isGenerating}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition disabled:bg-gray-400"
                >
                  {isGenerating ? "Generating..." : "Generate All Tests"}
                </button>
              </div>

              {error && <p className="text-center text-red-500 mb-4">{error}</p>}

              <ul className="space-y-6">
                {selectedCandidates.map((candidatefilename) => (
                  <li
                    key={candidatefilename}
                    className="p-6 border rounded-lg bg-gray-50 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <p className="font-semibold text-gray-800">{candidatefilename}</p>
                      {generatedTests[candidatefilename] ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`/take-test/${generatedTests[candidatefilename].testId}`}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Test Link
                          </a>
                          <span className={`text-sm font-medium ${generatedTests[candidatefilename].emailStatus === 'sent' ? 'text-green-700' : 'text-red-600'}`}>
                            Email: {generatedTests[candidatefilename].emailStatus}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Test not generated</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-6">
                <button
                  onClick={handleViewResult}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  View Test Result
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestManagement;
