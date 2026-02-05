import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Load employer jobs ONCE
  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/employer/jobs/");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load categories safely (handles paginated or normal response)
  const fetchCategories = async () => {
    try {
      const res = await api.get("/jobs/categories/");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  // ✅ Delete job
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await api.delete(`/jobs/employer/jobs/${jobId}/`);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch {
      alert("Failed to delete job");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, []);

  // ✅ FRONTEND filtering (no backend required)
  const filteredJobs = useMemo(() => {
    if (!selectedCategory) return jobs;
    return jobs.filter((job) => String(job.category) === selectedCategory);
  }, [jobs, selectedCategory]);

  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <h2>Employer Dashboard</h2>

        <Link to="/employer/post-job" className="btn btn-primary mt-3">
          Post New Job
        </Link>

        <hr />

        {/* ✅ Category Filter */}
    {/* 🔍 Compact Category Filter */}
<div className="d-flex justify-content-between align-items-center mb-3">
  <h4 className="mb-0">Your Posted Jobs</h4>

  <select
    className="form-select form-select-sm"
    style={{ width: "220px" }}
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
  >
    <option value="">All Categories</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>

        {loading && <p>Loading jobs...</p>}

        {!loading && filteredJobs.length === 0 && (
          <p className="text-muted">No jobs found in this category.</p>
        )}

        {filteredJobs.map((job) => (
          <div key={job.id} className="card mb-3 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold">{job.title}</h5>

              <p className="card-text text-muted">
                {job.description?.length > 120
                  ? job.description.slice(0, 120) + "..."
                  : job.description}
              </p>

              <p className="text-muted mb-1">📍 {job.location || "N/A"}</p>

              {job.salary && <p className="mb-1">💰 ₹{job.salary}</p>}

              {job.category_name && (
                <span className="badge bg-light text-dark border mb-2">
                  {job.category_name}
                </span>
              )}

              <div className="mt-3">
                <Link
                  to={`/employer/job/${job.id}/applicants`}
                  className="btn btn-sm btn-outline-secondary me-2"
                >
                  View Applicants
                </Link>

                <Link
                  to={`/employer/edit-job/${job.id}`}
                  className="btn btn-sm btn-outline-primary me-2"
                >
                  Edit
                </Link>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(job.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

