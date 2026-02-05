import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function SeekerDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 Search Fields
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  // ✅ Applied Jobs Tracker
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // 📂 Load categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/jobs/categories/");
      setCategories(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setCategories([]);
    }
  };

  // 💼 Load jobs
  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/");
      setJobs(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Load already applied job IDs from backend
  const fetchAppliedJobs = async () => {
    try {
      const res = await api.get("/jobs/applied-job-ids/");
      setAppliedJobs(new Set(res.data)); // convert array → Set
    } catch {
      setAppliedJobs(new Set());
    }
  };

  // 🚀 Load all data ONCE
  useEffect(() => {
    fetchCategories();
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  // 🎯 Live Filter
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const k = keyword.toLowerCase().trim();
      const l = location.toLowerCase().trim();
      const c = category ? String(category) : "";

      const title = (j.title || "").toLowerCase();
      const desc = (j.description || "").toLowerCase();
      const loc = (j.location || "").toLowerCase();
      const company = (j.company_name || "").toLowerCase();

      const matchKeyword =
        !k || title.includes(k) || desc.includes(k) || company.includes(k);

      const matchLocation = !l || loc.includes(l);
      const matchCategory = !c || String(j.category) === c;

      return matchKeyword && matchLocation && matchCategory;
    });
  }, [jobs, keyword, location, category]);

  // 🔗 Share Job
  const handleShare = async (job) => {
    const url = `${window.location.origin}/seeker/jobs/${job.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job at ${job.company_name}`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Job link copied to clipboard!");
    }
  };

  // 📨 Apply Job
  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply/`);
      setAppliedJobs(prev => new Set(prev).add(jobId));
      alert("Application submitted successfully!");
    } catch (err) {
      if (err.response?.data?.error === "Already applied") {
        setAppliedJobs(prev => new Set(prev).add(jobId));
        alert("You already applied for this job.");
      } else {
        alert("Failed to apply. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-4" style={{ maxWidth: "980px" }}>

        {/* 🔍 Search Bar (UNCHANGED UI) */}
        <div className="shadow-sm mb-4" style={{
          borderRadius: "16px",
          background: "#ffffff",
          padding: "14px",
          border: "1px solid #eee",
        }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row g-2 align-items-center">

              <div className="col-md-4">
                <div className="d-flex align-items-center px-3 search-box">
                  <i className="bi bi-search text-muted me-2"></i>
                  <input
                    type="text"
                    className="form-control border-0 bg-transparent shadow-none"
                    placeholder="Job title, skills or company"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="d-flex align-items-center px-3 search-box">
                  <i className="bi bi-geo-alt text-muted me-2"></i>
                  <input
                    type="text"
                    className="form-control border-0 bg-transparent shadow-none"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select search-box"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2 d-grid">
                <button className="btn btn-dark fw-semibold" style={{ borderRadius: "10px" }}>
                  Search
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* 🧾 Job Cards (100% SAME UI) */}
        <h5 className="fw-bold mb-3">Latest Jobs</h5>

        {loading && <p className="text-muted">Loading jobs...</p>}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center text-muted py-5">
            <h6>No jobs found</h6>
            <small>Try different keywords or location</small>
          </div>
        )}

        <div className="row g-3">
          {filteredJobs.map((job) => (
            <div key={job.id} className="col-md-6">
              <div className="card job-card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">

                  <h6 className="fw-bold mb-1" style={{ fontSize: "18px" }}>
                    {job.title}
                  </h6>

                  {/* Company Info Row */}
                  <div className="d-flex align-items-center gap-2 mb-2">
                   <img
  src={job.company_logo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
  alt="logo"
  style={{
    width: "38px",
    height: "38px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #eee",
    background: "#fff",
  }}
/>

                    <div>
                      <div className="fw-semibold" style={{ fontSize: "15px" }}>
                        {job.company_name}
                      </div>

                      {job.company_website && (
                        <a
                          href={job.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
                    📍 {job.location || "N/A"}
                  </p>

                  <div className="mb-2 d-flex flex-wrap gap-2">
                    {job.category_name && (
                      <span className="badge bg-light text-dark border">
                        {job.category_name}
                      </span>
                    )}
                    {job.salary && (
                      <span className="badge bg-success-subtle text-success border">
                        ₹ {job.salary}
                      </span>
                    )}
                  </div>

                  <p className="text-muted mb-3" style={{ fontSize: "14px", flexGrow: 1 }}>
                    {job.description?.length > 110
                      ? job.description.slice(0, 110) + "..."
                      : job.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <small className="text-muted">Recently posted</small>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-light border"
                        onClick={() => handleShare(job)}
                        style={{ borderRadius: "8px" }}
                      >
                        <i className="bi bi-share"></i>
                      </button>

                      <button
                        className={`btn btn-sm ${appliedJobs.has(job.id) ? "btn-success" : "btn-dark"}`}
                        disabled={appliedJobs.has(job.id)}
                        onClick={() => handleApply(job.id)}
                        style={{ borderRadius: "8px", fontWeight: 500 }}
                      >
                        {appliedJobs.has(job.id) ? "Applied" : "Apply Now"}
                      </button>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ borderRadius: "8px", fontWeight: 500 }}
                        onClick={() => navigate(`/seeker/jobs/${job.id}`)}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .job-card {
            border-radius: 14px;
            transition: transform .2s ease, box-shadow .2s ease;
          }
          .job-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.08);
          }
          .search-box {
            height: 46px;
            border-radius: 10px !important;
            border: 1px solid #e5e7eb !important;
            background: #fafafa !important;
          }
        `}</style>

      </div>
    </>
  );
}