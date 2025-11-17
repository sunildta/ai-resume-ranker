import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";

const JobPostings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingTextRef = useRef(null); // 👈 for GSAP animation

  useEffect(() => {
    if (loading && window.gsap && loadingTextRef.current) {
      window.gsap.fromTo(
        loadingTextRef.current,
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [loading]);

  // ✅ Validation Function
  const isValidText = (text) => {
    // Reject if only numbers or special characters
    const onlyNumbers = /^[0-9]+$/;
    const onlySpecialChars = /^[^a-zA-Z0-9]+$/;

    if (!text.trim()) return false; // empty
    if (onlyNumbers.test(text)) return false; // only numbers
    if (onlySpecialChars.test(text)) return false; // only symbols

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Validate inputs
    if (!title || !description) {
      alert("⚠️ Please fill out both Job Title and Job Description.");
      return;
    }

    if (!isValidText(title)) {
      alert("❌ Invalid Job Title. Please enter a proper title (letters required).");
      return;
    }

    if (!isValidText(description)) {
      alert("❌ Invalid Job Description. Please enter a proper description (letters required).");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    try {
      setLoading(true);
      const res = await API.post("/post-job/", formData);
      const jobId = res.data.job_id;
      navigate(`/dashboard/upload-resume/${jobId}`);
    } catch (err) {
      console.error("Error posting job:", err);
      alert("🚨 Failed to post job. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-12 px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Create Job Posting
      </h2>

      {/* ✅ Flash Message */}
      {location.state?.msg && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
          {location.state.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Job Title */}
        <div className="mb-6">
          <label
            htmlFor="jobTitle"
            className="block text-lg font-semibold text-gray-800 mb-2"
          >
            Job Title
          </label>
          <input
            type="text"
            id="jobTitle"
            placeholder="Enter Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-violet-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <label
            htmlFor="jobDescription"
            className="block text-lg font-semibold text-gray-800 mb-2"
          >
            Job Description
          </label>
          <textarea
            id="jobDescription"
            rows="6"
            placeholder="Enter Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500} 
            className="w-full border border-violet-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-600 resize-y"
          />
          <p className="text-sm text-gray-500 mt-1">
            {description.length} / Min: 150 - Max:500 - characters
          </p>
        </div>

        {/* Save Job Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center bg-violet-600 text-white px-8 py-3 rounded-full shadow-md transition duration-200 
              ${loading ? "bg-violet-400 cursor-not-allowed" : "hover:bg-violet-700"}`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                <span ref={loadingTextRef}>Processing...</span>
              </>
            ) : (
              "Post Job"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostings;
