import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API, { filterShortlistedResumes } from "../api/axios";
import { useShortlist } from "../contexts/ShortlistContext";
import FilterPanel from "../components/FilterPanel";

function Shortlisted() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [originalResumes, setOriginalResumes] = useState([]); // Store original unfiltered data
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStats, setFilterStats] = useState(null);

  // ✅ Fix: Correctly destructure all values from the context
  const { 
    selectedCandidates, 
    setSelectedCandidates, 
    setCurrentJobId,
    setCurrentFilters
  } = useShortlist();

  // Set current jobId in context when component loads
  useEffect(() => {
    if (jobId) {
      setCurrentJobId(jobId);
    }
  }, [jobId, setCurrentJobId]);

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        const res = await API.get(`/shortlist/${jobId}`);
        const resumeData = res.data.shortlisted || [];
        setResumes(resumeData);
        setOriginalResumes(resumeData); // Store original data for clearing filters
        // Initialize filters in context with default values
        setCurrentFilters({
          minScore: 0,
          maxScore: 100,
          keywords: "",
          excludeKeywords: "",
          minExperience: 0,
          maxExperience: 50,
          requiredSkills: "",
          educationLevel: "Any",
          sortBy: "score",
        });
      } catch (err) {
        console.error("Error fetching shortlisted resumes:", err);
        setError("Failed to load shortlisted resumes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, [jobId, setCurrentFilters]);

  // Handle applying filters
  const handleApplyFilters = async (filters) => {
    try {
      setFilterLoading(true);
      const formattedFilters = {
        min_score: filters.minScore,
        max_score: filters.maxScore,
        keywords: filters.keywords,
        exclude_keywords: filters.excludeKeywords,
        min_experience: filters.minExperience,
        max_experience: filters.maxExperience,
        required_skills: filters.requiredSkills,
        education_level: filters.educationLevel,
        sort_by: filters.sortBy
      };
      
      const result = await filterShortlistedResumes(jobId, formattedFilters);
      setResumes(result.shortlisted);
      setFilterStats({
        totalBefore: result.total_before_filter,
        totalAfter: result.total_after_filter
      });
      setCurrentFilters(filters); // ✅ Save filters to context
    } catch (err) {
      console.error("Error applying filters:", err);
      // Use a custom modal instead of alert()
      // alert("Failed to apply filters. Please try again.");
    } finally {
      setFilterLoading(false);
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setResumes(originalResumes);
    setFilterStats(null);
    setCurrentFilters({}); // ✅ Clear filters in context
  };

  // ✅ Checkbox toggle
  const handleCheckboxChange = (filename) => {
    setSelectedCandidates((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  // ✅ Next round - Save selected candidates
  const handleNextRound = async () => {
    if (selectedCandidates.length === 0) {
      setError("Please select at least one candidate to proceed.");
      return;
    }
    
    try {
      setFilterLoading(true);
      setError("");
      
      // Save selected candidates as final shortlisted
      const response = await axios.post(
        `http://localhost:8000/shortlist/${jobId}/select`,
        selectedCandidates,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Selected candidates saved:', response.data);
      
      // Navigate to test management page
      navigate(`/dashboard/test-management/${jobId}`);
      
    } catch (err) {
      console.error("Error saving selected candidates:", err);
      setError("Failed to save selected candidates. Please try again.");
    } finally {
      setFilterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-violet-600 font-semibold text-lg animate-pulse">
          Loading resumes to be Shortlisted...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Shortlisted Resumes
        </h2>

        {/* Filter Panel */}
        <FilterPanel 
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isLoading={filterLoading}
        />

        {/* Filter Statistics */}
        {filterStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  Filter Results: {filterStats.totalAfter} of {filterStats.totalBefore} resumes
                </span>
              </div>
              <span className="text-sm text-blue-600">
                {filterStats.totalBefore - filterStats.totalAfter} filtered out
              </span>
            </div>
          </div>
        )}

        {/* Selection Status */}
        {selectedCandidates.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-medium">
                  {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected for testing
                </span>
              </div>
              <button
                onClick={() => setSelectedCandidates([])}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl p-8">
          {resumes.length === 0 ? (
            <p className="text-center text-gray-600">
              {filterStats ? "No resumes match your filters." : "No resumes found for this job."}
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {resumes.map((resume, idx) => (
                  <li
                    key={resume.filename}
                    className="flex justify-between items-center p-5 border rounded-lg hover:shadow-md transition bg-gray-50"
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(resume.filename)}
                        onChange={() => handleCheckboxChange(resume.filename)}
                        className="h-5 w-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full">
                            Rank #{idx + 1}
                          </span>
                          <p className="font-semibold text-gray-800">
                            {resume.filename}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                            Match: {resume.match_score}%
                          </span>
                          {resume.experience_years !== undefined && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                              Exp: {resume.experience_years} years
                            </span>
                          )}
                          {resume.education_level && resume.education_level !== "Not Specified" && (
                            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                              {resume.education_level}
                            </span>
                          )}
                        </div>
                        {resume.extracted_preview && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {resume.extracted_preview}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={`http://127.0.0.1:8000/view-resume/${resume.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition"
                    >
                      View Resume
                    </a>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleNextRound}
                  disabled={selectedCandidates.length === 0 || filterLoading}
                  className={`px-8 py-4 rounded-full font-semibold transition duration-200 shadow-lg ${
                    selectedCandidates.length === 0 || filterLoading
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl'
                  }`}
                >
                  {filterLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Proceed with ${selectedCandidates.length} Selected Candidate${selectedCandidates.length > 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shortlisted;
