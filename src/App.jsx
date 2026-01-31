import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ShortlistProvider } from "./contexts/ShortlistContext";

// Import pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TakeTest from "./pages/TakeTest";

// Import dashboard
import DashboardLayout from "./dashboard/DashboardLayout";
import Dashboard from "./dashboard/Dashboard";
import Jobposting from "./dashboard/Jobposting";
import Uploadresume from "./dashboard/Uploadresume";
import ShortlistedResumes from "./dashboard/ShortlistedResumes";
import Shortlisted from "./dashboard/Shortlisted";
import Testmanagement from "./dashboard/Testmanagement";
import Testresult from "./dashboard/Testresult";
import AdminUsers from "./dashboard/AdminUsers";
import ComingSoon from "./dashboard/ComingSoon";

// Import components
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <ShortlistProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/take-test/:testId" element={<TakeTest />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="job-postings" element={<Jobposting />} />
              <Route path="upload-resume/:jobId" element={<Uploadresume />} />
              <Route path="short-listed/:jobId" element={<Shortlisted />} />
              <Route path="shortlisted-resumes" element={<ShortlistedResumes />} />
              <Route path="test-management/:jobId" element={<Testmanagement />} />
              <Route path="test-results" element={<Testresult />} />
              <Route path="admin-users" element={<AdminUsers />} />
              <Route path="analytics" element={<ComingSoon />} />
              <Route path="settings" element={<ComingSoon />} />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ShortlistProvider>
    </AuthProvider>
  );
}

export default App;
