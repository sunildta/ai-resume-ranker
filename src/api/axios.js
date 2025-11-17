// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", 
});

// Upload multiple resumes
export const uploadMultipleResumes = async (jobId, files) => {
  const formData = new FormData();
  formData.append("job_id", jobId);

  files.forEach((file) => {
    formData.append("files", file); 
  });

  try {
    const res = await API.post("/upload-resumes/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // return server response
  } catch (error) {
    throw error.response?.data || { detail: "Unknown error" };
  }
};

 

// Filter shortlisted resumes
export const filterShortlistedResumes = async (jobId, filters) => {
  const formData = new FormData();
  Object.entries(filters).forEach(([key, value]) => {
    formData.append(key, value);
  });

  try {
    const res = await API.post(`/shortlist/${jobId}/filter`, formData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Unknown error" };
  }
};

// Create aptitude test for a candidate
export const createTestForCandidate = async (payload) => {
  try {
    const res = await API.post("/api/test/create", payload);
    const testId = res.data.test_id;
    const emailStatus = res.data.email_status;
    return { testId, emailStatus }; // return both testId and email status
  } catch (error) {
    throw error.response?.data || { detail: "Failed to create test" };
  }
};

export const fetchTestResults = async (jobTitle) => {
  try {
    const res = await API.get(`/api/test/results/${jobTitle}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to fetch test results" };
  }
};

export default API;
