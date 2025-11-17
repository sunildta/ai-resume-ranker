import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { uploadMultipleResumes } from "../api/axios";

function UploadResume() {
  const { jobId } = useParams(); 
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const loadingTextRef = useRef(null);

  // ✅ Redirect if no jobId in URL
  if (!jobId) {
    return (
      <Navigate
        to="/dashboard/job-postings"
        replace
        state={{ msg: "Please create a job first" }}
      />
    );
  }

  useEffect(() => {
    if (uploading && window.gsap && loadingTextRef.current) {
      // Animate "Uploading..." text when uploading starts
      window.gsap.fromTo(
        loadingTextRef.current,
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [uploading]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select at least one resume!");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadMultipleResumes(jobId, files);
      setResults(data.results);
    } catch (error) {
      console.error("Error uploading resumes:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleViewShortlist = () => {
    navigate(`/dashboard/short-listed/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Upload Candidate Resumes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload multiple resumes for <span className="font-semibold text-violet-600">Job #{jobId}</span> and let our AI analyze and rank candidates automatically
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Area */}
            <div className="relative">
              <div className="border-2 border-dashed border-violet-300 rounded-2xl p-8 text-center hover:border-violet-400 transition-colors duration-200 bg-gradient-to-br from-violet-50 to-purple-50">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-violet-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  Drag and drop files here, or click to browse
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Supports PDF and DOCX files • Multiple files allowed
                </div>
                {files.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Selected Files ({files.length}):</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center text-sm rounded-lg px-3 py-2 bg-white/60 text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className={`flex items-center justify-center px-8 py-4 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  uploading || files.length === 0
                    ? "bg-gray-400 cursor-not-allowed scale-100 hover:scale-100"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/25"
                }`}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span ref={loadingTextRef}>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : 'Resumes'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="mt-12">
              <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Results</h3>
                  <p className="text-gray-600">Resume processing completed successfully</p>
                </div>

                <div className="space-y-3 mb-8">
                  {results.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-l-4 transition-all duration-200 hover:shadow-md ${
                        r.error
                          ? "bg-red-50 border-l-red-400 border border-red-200"
                          : "bg-green-50 border-l-green-400 border border-green-200"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {r.error ? (
                          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold ${r.error ? "text-red-800" : "text-green-800"}`}>
                              {r.filename}
                            </p>
                            {r.name && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                👤 {r.name}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${r.error ? "text-red-600" : "text-green-600"}`}>
                            {r.error || r.message}
                          </p>
                          {r.email && (
                            <p className="text-xs text-gray-500 mt-1">
                              📧 {r.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={handleViewShortlist}
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    View Shortlisted Resumes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        {results.length === 0 && !uploading && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Use Our AI Resume Ranker?</h2>
              <p className="text-gray-600">Streamline your hiring process with intelligent resume analysis</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">Process hundreds of resumes in minutes with our AI-powered analysis</p>
              </div>
              
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Matching</h3>
                <p className="text-gray-600 text-sm">AI analyzes skills, experience, and qualifications for perfect job fits</p>
              </div>
              
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Detailed Analytics</h3>
                <p className="text-gray-600 text-sm">Get comprehensive insights and rankings for data-driven decisions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadResume;
