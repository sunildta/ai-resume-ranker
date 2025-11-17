import  { useState, useEffect } from "react"; 
import axios from "axios"; 

const TestResult = () => { 
  const [jobTitle, setJobTitle] = useState(""); 
  const [candidates, setCandidates] = useState([]); 
  const [jobInfo, setJobInfo] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  // Validation function (unchanged)
  const isValidJobTitle = (text) => { 
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(text.trim()); 
  }; 

  const handleSearch = async () => { 
    if (!jobTitle.trim()) { 
      setError("⚠️ Please enter a job title before searching."); 
      return; 
    } 

    if (!isValidJobTitle(jobTitle)) { 
      setError("⚠️ Job title should only contain alphabets and spaces."); 
      return; 
    } 

    setLoading(true); 
    setError(null); 

    try { 
      
      const response = await axios.get( 
        `http://localhost:8000/api/test/results/${encodeURIComponent(jobTitle)}` 
      ); 
      
      const data = response.data;

      setCandidates(data.candidates || []); 
      setJobInfo({ 
        jobId: data.job_id, // Note: This might be null if multiple jobs are found, use jobTitle instead
        jobTitle: data.job_title, 
        jobDescription: data.job_description, 
        totalCandidates: data.total_candidates, 
        submittedCount: data.submitted_count, 
        pendingCount: data.pending_count 
      }); 
    } catch (err) { 
      console.error("Error fetching results:", err); 
      // Display a more specific error if available from the backend response
      const detail = err.response?.data?.detail || "Failed to fetch results. Check server console.";
      setError(`❌ Error: ${detail}`); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  
  useEffect(() => { 
    const timer = setTimeout(() => { 
      if (jobTitle.trim().length > 2 && isValidJobTitle(jobTitle)) { 
        handleSearch(); 
      } 
    }, 500); 
    return () => clearTimeout(timer); 
  }, [jobTitle]); 

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-12 px-4"> 
      
      <div className="max-w-7xl mx-auto mb-12 text-center "> 
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-6 shadow-lg"> 
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> 
          </svg> 
        </div> 
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4"> 
          🏆 Candidate Rankings & Test Results 
        </h1> 
        <p className="text-lg text-gray-600 max-w-3xl mx-auto"> 
          Search for a job position to view candidate rankings and test performance 
        </p> 
      </div> 

      <div className="max-w-7xl mx-auto"> 
        
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20 mb-8"> 
            <div className="text-center mb-6"> 
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Job Candidates</h2> 
              <p className="text-gray-600">Search for a specific job position to view selected candidates</p> 
            </div> 
          <div className="flex gap-6 items-end"> 
            <div className="flex-1"> 
              <label className="block text-sm font-medium text-gray-700 mb-2"> 
                Job Position 
              </label> 
              <div className="relative"> 
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  placeholder="Enter job title (e.g., Software Developer, Data Scientist)" 
                  className={`w-full p-4 pl-12 border-2 rounded-2xl focus:ring-2 outline-none transition-all duration-200 ${ 
                    error 
                       ? "border-red-400 focus:ring-red-500 bg-red-50" 
                       : "border-violet-200 focus:ring-violet-500 focus:border-violet-400 bg-violet-50/30" 
                   }`} 
                /> 
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" /> 
                </svg> 
              </div>  
            </div> 
            <div className="pt-6"> 
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

        {/* Error Message */} 
        {error && ( 
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg"> 
            <div className="flex items-center"> 
              <div className="text-red-500 mr-3"> 
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"> 
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  /> 
                </svg> 
              </div> 
              <p className="text-red-700 font-medium">{error}</p> 
            </div> 
          </div> 
        )} 

        {/* Enhanced Job Info */}
        {jobInfo && candidates.length > 0 && (
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
                    <p className="text-sm text-gray-500">Consolidated Results</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{jobInfo.jobDescription || 'No description available for consolidated search.'}</p>
              </div>
              <div className="ml-8 flex gap-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl text-center shadow-lg">
                  <div className="text-2xl font-bold">{jobInfo.submittedCount}</div>
                  <div className="text-sm opacity-90">Submitted</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-2xl text-center shadow-lg">
                  <div className="text-2xl font-bold">{jobInfo.pendingCount}</div>
                  <div className="text-sm opacity-90">Pending</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl text-center shadow-lg">
                  <div className="text-2xl font-bold">{jobInfo.totalCandidates}</div>
                  <div className="text-sm opacity-90">Total Candidates</div>
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
              No Candidates Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              No candidates have been shortlisted for this job position yet. Once candidates are shortlisted and take tests, they will appear here.
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
              const isSubmitted = candidate.status === "Submitted";
              const isPending = candidate.status === "Test Pending";
              const testRank = candidate.test_rank;
              
              // Determine the display rank and styling
              const displayRank = isSubmitted && testRank ? testRank : index + 1;
              
              // Special styling for top 3 ranks
              const getRankStyling = (rank) => {
                if (rank === 1) {
                  return {
                    cardClass: "group bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-yellow-300 hover:transform hover:scale-[1.02] overflow-hidden",
                    badgeClass: "absolute -top-3 -right-3 w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 border-4 border-yellow-200",
                    headerClass: "h-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400",
                    icon: "🥇"
                  };
                } else if (rank === 2) {
                  return {
                    cardClass: "group bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-gray-300 hover:transform hover:scale-[1.02] overflow-hidden",
                    badgeClass: "absolute -top-3 -right-3 w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-2xl bg-gradient-to-br from-gray-400 via-slate-500 to-zinc-600 border-4 border-gray-200",
                    headerClass: "h-2 bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400",
                    icon: "🥈"
                  };
                } else if (rank === 3) {
                  return {
                    cardClass: "group bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-orange-300 hover:transform hover:scale-[1.02] overflow-hidden",
                    badgeClass: "absolute -top-3 -right-3 w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-600 border-4 border-orange-200",
                    headerClass: "h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400",
                    icon: "🥉"
                  };
                } else {
                  return {
                    cardClass: "group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:transform hover:scale-[1.02] overflow-hidden",
                    badgeClass: "absolute -top-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 border-4 border-white",
                    headerClass: isSubmitted ? 'h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400' :
                                         isPending ? 'h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-400' :
                                         'h-2 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400',
                    icon: ""
                  };
                }
              };
              
              const rankStyling = getRankStyling(displayRank);
              
              return (
                <div
                  key={candidate.candidate_id || candidate.filename || index}
                  className={rankStyling.cardClass}
                >
                  {/* Enhanced Rank Badge */}
                  <div className="relative">
                    <div className={rankStyling.badgeClass}>
                      <span className="text-sm flex items-center">
                        {rankStyling.icon && <span className="mr-1">{rankStyling.icon}</span>}
                        #{displayRank}
                      </span>
                    </div>
                    
                    {/* Rank-based Gradient Header Bar */}
                    <div className={rankStyling.headerClass}></div>
                    
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
                                <div className="flex items-center text-gray-500">
                                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-xs truncate">{candidate.filename || "File Unavailable"}</span>
                                </div>
                            </div>
                            
                            {/* Enhanced Status Badge */}
                            <span className={`px-4 py-2 rounded-full text-xs font-bold border shadow-sm ${
                                isSubmitted ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200' :
                                isPending ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border-orange-200' :
                                'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200'
                            }`}>
                              {candidate.status || 'Unknown'}
                            </span>
                        </div>
                      </div>

                      {/* Candidate Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium">Match Score (AI)</div>
                          <div className="text-lg font-bold text-blue-800">
                            {candidate.match_score ? `${candidate.match_score.toFixed(0)}%` : "N/A"}
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-xs text-purple-600 font-medium">Experience</div>
                          <div className="text-lg font-bold text-purple-800">
                            {candidate.experience_years || 0} yrs
                          </div>
                        </div>
                      </div>

                      {/* Test Results Section */}
                      {isSubmitted ? (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-xs text-green-600 font-medium">Test Score</div>
                            <div className="text-lg font-bold text-green-800">
                              {candidate.test_score || 0}/{candidate.total_questions || 0}
                            </div>
                          </div>
                          <div className="bg-indigo-50 p-3 rounded-lg">
                            <div className="text-xs text-indigo-600 font-medium">Percentage</div>
                            <div className="text-lg font-bold text-indigo-800">
                              {candidate.percentage ? `${candidate.percentage.toFixed(1)}%` : "0%"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-3 rounded-lg mb-4">
                          <div className="text-xs text-orange-600 font-medium">Test Status</div>
                          <div className="text-lg font-bold text-orange-800">
                            Test Pending
                          </div>
                        </div>
                      )}

                      {/* Education Level */}
                      {candidate.education_level && candidate.education_level !== "Not Specified" && (
                        <div className="mb-4">
                          <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                            🎓 {candidate.education_level}
                          </span>
                        </div>
                      )}

                      {/* Submission Time for Completed Tests */}
                      {isSubmitted && candidate.submitted_at && (
                        <div className="mb-4 border-t pt-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Submitted: {new Date(candidate.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="border-t pt-4">
                        {candidate.filename ? (
                          <a
                            href={`http://localhost:8000/view-resume/${candidate.filename}`}
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

export default TestResult;
