import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ShortlistProvider } from './contexts/ShortlistContext';


// Public Pages & Layout
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import AptitudeTest from './components/Aptitude_test';



// Dashboard & Protected Pages
import DashboardLayout from './dashboard/DashboardLayout';
import Dashboard from './dashboard/Dashboard';
import JobPostings from './dashboard/Jobposting';
import Uploadresume from './dashboard/Uploadresume';
import Shortlisted from './dashboard/Shortlisted';
import ShortlistedResumes from './dashboard/ShortlistedResumes';
import TestManagement from './dashboard/Testmanagement';
import TestResult from './dashboard/Testresult';
import ComingSoon from './dashboard/ComingSoon';


function App() {
  useEffect(() => {
    // Register GSAP ScrollTrigger plugin (optional, for landing page animation)
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
      <Routes>

        {/* Public Website Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="/take-test/:testId" element={<AptitudeTest />} />
        </Route>


        {/* HR Dashboard Routes */}
        <Route path="/dashboard" element={
          <ShortlistProvider>
            <DashboardLayout/>
          </ShortlistProvider>
        }>
          <Route index element={<Dashboard />} />
          <Route path="job-postings" element={<JobPostings />} />
          <Route path="upload-resume/:jobId" element={<Uploadresume />} />
          <Route path="short-listed/:jobId" element={<Shortlisted />} />
          <Route path="shortlisted-resumes" element={<ShortlistedResumes />} />
          <Route path="test-management/:jobId" element={<TestManagement />} />
          <Route path="test-results" element={<TestResult />} />
          <Route path="comingsoon" element={<ComingSoon />} />

          
        </Route>
        
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
