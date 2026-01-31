import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useShortlist } from "../contexts/ShortlistContext";
import API from "../api/axios";
import { sanitizeFilename } from "../utils/fileUtils";

const ShortlistedResumes = () => {
  const { jobId: urlJobId } = useParams();
  const { currentJobId } = useShortlist();

  const [jobTitle, setJobTitle] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get jobId from URL params or context
  const jobId = urlJobId || currentJobId;

  console.log('🔍 ShortlistedResumes - URL JobId:', urlJobId, 'Context JobId:', currentJobId, 'Final JobId:', jobId);

  // ✅ Validation function
  const isValidText = (text) => {
    const onlyNumbers = /^[0-9]+$/;
    const onlySpecialChars = /^[^a-zA-Z0-9]+$/;

    if (!text.trim()) return false; // Empty
    if (onlyNumbers.test(text)) return false; // Only numbers
    if (onlySpecialChars.test(text)) return false; // Only symbols

    return true;
  };

  // Function to load candidates directly by jobId
  const loadCandidatesByJobId = async (targetJobId) => {
    if (!targetJobId) {
      setError("⚠️ No job ID available. Please select a job first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First get job info
      const jobsResponse = await API.get(`/debug/jobs`);
      const job = jobsResponse.data.jobs.find((j) => j.id === targetJobId);

      if (!job) {
        setError(`❌ No job found with ID "${targetJobId}".`);
        setLoading(false);
        return;
      }

      // Get selected candidates for this job (from Firestore subcollection)
      const shortlistedResponse = await API.get(
        `/shortlist/${targetJobId}/select`
      );

      setCandidates(shortlistedResponse.data.shortlisted || []);
      setJobInfo({
        jobId: job.id,
        jobTitle: job.title,
        jobDescription: job.description || "",
        totalCandidates: shortlistedResponse.data.shortlisted?.length || 0,
      });
      setJobTitle(job.title); // Update job title for display
    } catch (err) {
      console.error("Error fetching shortlisted resumes:", err);
      setError(" Failed to fetch shortlisted resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!isValidText(jobTitle)) {
      setError(
        "❌ Invalid Job Title. Please enter a proper job title (letters required)."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First get the job ID by searching for job title
      const jobsResponse = await API.get(`/debug/jobs`);
      const job = jobsResponse.data.jobs.find((j) =>
        j.title.toLowerCase().includes(jobTitle.toLowerCase())
      );

      if (!job) {
        setError(`❌ No job found with title "${jobTitle}".`);
        setLoading(false);
        return;
      }

      // Get selected candidates for this job
      const shortlistedResponse = await API.get(
        `/shortlist/${job.id}/select`
      );

      setCandidates(shortlistedResponse.data.shortlisted || []);
      setJobInfo({
        jobId: job.id,
        jobTitle: job.title,
        jobDescription: job.description || "",
        totalCandidates: shortlistedResponse.data.shortlisted?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching shortlisted resumes:", err);
      setError("🚨 Failed to fetch shortlisted resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load candidates when component mounts with jobId
  useEffect(() => {
    if (jobId) {
      loadCandidatesByJobId(jobId);
    }
  }, [jobId]);

  // Auto-search when job title changes (debounce) - only if no jobId
  useEffect(() => {
    if (!jobId) {
      const timer = setTimeout(() => {
        if (jobTitle.trim().length > 2 && isValidText(jobTitle)) {
          handleSearch();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jobTitle, jobId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-12 px-4">
      {/* Enhanced Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Selected Candidate Resumes
          </h1>
          {jobId ? (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Viewing HR selected candidates for the job position • Final shortlisted candidates ready for review
            </p>
          ) : (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Search for a job position to view HR selected candidate resumes and make final hiring decisions
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Search Bar - Only show if no jobId from context */}
        {!jobId && (
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Job Candidates</h2>
              <p className="text-gray-600">Search for a specific job position to view selected candidates</p>
            </div>
            <div className="flex gap-6 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Job Position
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Enter job title (e.g., Software Developer, Data Scientist)"
                    className={`w-full p-4 pl-12 border-2 rounded-2xl focus:ring-2 outline-none transition-all duration-200 ${error
                      ? "border-red-400 focus:ring-red-500 bg-red-50"
                      : "border-violet-200 focus:ring-violet-500 focus:border-violet-400 bg-violet-50/30"
                      }`}
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                  </svg>
                </div>
              </div>
              <div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !jobTitle.trim()}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Jobs
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 p-6 mb-8 rounded-2xl shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Search Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent absolute top-0"></div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Candidates...</h3>
              <p className="text-gray-500">Fetching selected candidate data</p>
            </div>
          </div>
        )}

        {/* Enhanced Job Info */}
        {jobInfo && !loading && (
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {jobInfo.jobTitle}
                    </h2>
                    <p className="text-sm text-gray-500">Job Position</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{jobInfo.jobDescription}</p>
              </div>
              <div className="ml-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl text-center shadow-lg">
                  <div className="text-2xl font-bold">{jobInfo.totalCandidates}</div>
                  <div className="text-sm opacity-90">Selected</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-medium">ID: {jobInfo.jobId}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Final Selection Phase</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced No Candidates Found */}
        {!loading && !error && candidates.length === 0 && jobInfo && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-white/20">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No Selected Candidates
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              No candidates have been selected for this job position yet. Once HR reviews and selects candidates from the shortlist, they will appear here.
            </p>
            <div className="inline-flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Check back later or contact HR for updates
            </div>
          </div>
        )}

        {/* Enhanced Candidates Grid */}
        {!loading && candidates.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {candidates.map((candidate, index) => {
              const rankDisplay = candidate.rank || index + 1;

              return (
                <div
                  key={candidate.candidate_id || index}
                  className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:transform hover:scale-[1.02] overflow-hidden"
                >
                  {/* Enhanced Rank Badge */}
                  <div className="relative">
                    <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 border-4 border-white">
                      <span className="text-sm">#{rankDisplay}</span>
                    </div>

                    {/* Gradient Header Bar */}
                    <div className="h-2 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400"></div>

                    <div className="p-8">
                      {/* Enhanced Header */}
                      <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-violet-700 transition-colors">
                              {candidate.candidate_name || candidate.name || "Anonymous Candidate"}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <svg className="w-4 h-4 mr-2 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                              <span className="text-sm">{candidate.candidate_email || candidate.email || "Email not provided"}</span>
                            </div>
                            {candidate.filename && (
                              <div className="flex items-center text-gray-500">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-xs truncate">{candidate.filename}</span>
                              </div>
                            )}
                          </div>

                          {/* Enhanced Status Badge */}
                          <span className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-sm">
                            {candidate.status === 'selected_for_test' ? 'Test Ready' : candidate.status || 'Shortlisted'}
                          </span>
                        </div>
                      </div>

                      {/* Candidate Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium">Match Score</div>
                          <div className="text-lg font-bold text-blue-800">
                            {candidate.match_score ? `${candidate.match_score}%` : "0%"}
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-xs text-purple-600 font-medium">Experience</div>
                          <div className="text-lg font-bold text-purple-800">
                            {candidate.experience_years || 0} yrs
                          </div>
                        </div>
                      </div>

                      {/* Education Level */}
                      {candidate.education_level && candidate.education_level !== "Not Specified" && (
                        <div className="mb-4">
                          <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                            🎓 {candidate.education_level}
                          </span>
                        </div>
                      )}

                      {/* Preview Text */}
                      {(candidate.preview_text || candidate.extracted_text) && (
                        <div className="mb-4 border-t pt-4">
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {candidate.preview_text ||
                              candidate.extracted_text?.substring(0, 200) ||
                              "No preview available"}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="border-t pt-4">
                        {candidate.filename ? (
                          <a
                            href={`http://localhost:8000/view-resume/${sanitizeFilename(candidate.filename)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-violet-600 hover:to-purple-700 transition-colors flex items-center justify-center"
                          >
                            📄 View Resume
                          </a>
                        ) : (
                          <button className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed">
                            📄 Resume Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistedResumes;
