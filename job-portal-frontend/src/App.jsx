import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import RegisterSeeker from "./auth/RegisterSeeker";
import RegisterEmployer from "./auth/RegisterEmployer";

import EmployerDashboard from "./employer/Dashboard";
import SeekerDashboard from "./seeker/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

import PostJob from "./employer/PostJob";
import EditJob from "./employer/EditJob";
import JobList from "./seeker/JobList";
import AppliedJobs from "./seeker/AppliedJobs";
import Applicants from "./employer/Applicants";
import CandidateProfile from "./employer/CandidateProfile";

import EditSeekerProfile from "./seeker/EditProfile";
import SeekerAccount from "./seeker/Account";
import ChangePassword from "./auth/ChangePassword";
import JobDetails from "./seeker/JobDetails";
import EmployerProfile from "./employer/EmployerProfile";
import EmployerSettings from "./employer/Settings";
import Contact from "./components/Contact";
import ForgotPassword from "./auth/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/register/seeker" element={<RegisterSeeker />} />
        <Route path="/register/employer" element={<RegisterEmployer />} />
        <Route path="/seeker/jobs/:id" element={<JobDetails />} />

        {/* ✅ Seeker Routes */}
        <Route
          path="/seeker/dashboard"
          element={
            <ProtectedRoute role="seeker">
              <SeekerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seeker/jobs"
          element={
            <ProtectedRoute role="seeker">
              <JobList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seeker/applied-jobs"
          element={
            <ProtectedRoute role="seeker">
              <AppliedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seeker/profile"
          element={
            <ProtectedRoute role="seeker">
              <EditSeekerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seeker/account"
          element={
            <ProtectedRoute role="seeker">
              <SeekerAccount />
            </ProtectedRoute>
          }
        />

        {/* ✅ Employer Routes */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute role="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/post-job"
          element={
            <ProtectedRoute role="employer">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/edit-job/:id"
          element={
            <ProtectedRoute role="employer">
              <EditJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/job/:jobId/applicants"
          element={
            <ProtectedRoute role="employer">
              <Applicants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/candidate/:seekerId"
          element={
            <ProtectedRoute role="employer">
              <CandidateProfile />
            </ProtectedRoute>
          }
        />

        {/* Generic */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
  path="/seeker/jobs/:id"
  element={
    <ProtectedRoute role="seeker">
      <JobDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/employer/profile"
  element={
    <ProtectedRoute role="employer">
      <EmployerProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/employer/Settings"
  element={
    <ProtectedRoute role="employer">
      <EmployerSettings />
    </ProtectedRoute>
  }
/>
<Route path="/contact" element={<Contact />} />
<Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/about" element={<div className="container mt-4">About Us Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;