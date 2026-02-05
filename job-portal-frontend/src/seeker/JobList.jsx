import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}/`);
        setJob(res.data);
      } catch (err) {
        console.error("Failed to load job details", err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const applyJob = async () => {
    if (!job?.id) return;
    setApplying(true);

    try {
      await api.post(`/jobs/${job.id}/apply/`);
      alert("✅ Applied successfully!");
      navigate("/seeker/applied-jobs");
    } catch (err) {
      if (err.response?.status === 400) {
        alert("⚠ You already applied for this job.");
      } else {
        alert("❌ Failed to apply.");
      }
    } finally {
      setApplying(false);
    }
  };

  const shareJob = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("✅ Job link copied to clipboard!");
    } catch {
      alert("❌ Unable to copy link. Please copy from address bar.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-4" style={{ maxWidth: "980px" }}>
        {/* ✅ Top navigation */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <Link to="/seeker/jobs" className="btn btn-outline-dark btn-sm">
            Browse Jobs
          </Link>
        </div>

        {loading && <p className="text-muted">Loading job details...</p>}

        {!loading && !job && (
          <div className="alert alert-danger">Job not found ❌</div>
        )}

        {!loading && job && (
          <>
            {/* ✅ Header card */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between flex-wrap gap-3">
                  {/* Left side */}
                  <div style={{ minWidth: "260px" }}>
                    <h4 className="mb-1 fw-bold">{job.title}</h4>

                    <div className="text-muted" style={{ fontSize: "14px" }}>
                      <span className="fw-semibold text-dark">
                        {job.company_name || "Company"}
                      </span>{" "}
                      · <span>📍 {job.location || "N/A"}</span>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {job.category_name && (
                        <span
                          className="badge text-bg-light"
                          style={{ border: "1px solid #eee" }}
                        >
                          {job.category_name}
                        </span>
                      )}

                      <span
                        className="badge text-bg-light"
                        style={{ border: "1px solid #eee" }}
                      >
                        Full-time
                      </span>

                      {job.salary && (
                        <span className="badge text-bg-success">Salary</span>
                      )}
                    </div>

                    {/* Salary */}
                    {job.salary && (
                      <div className="mt-3 fw-bold" style={{ color: "#16a34a" }}>
                        💰 ₹{job.salary}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="mt-3 text-muted" style={{ fontSize: "14px" }}>
                      <div>
                        <span className="fw-semibold">Posted:</span>{" "}
                        {job.posted_at ? new Date(job.posted_at).toDateString() : "N/A"}
                      </div>
                      <div>
                        <span className="fw-semibold">Last date:</span>{" "}
                        {job.last_date || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Company logo + actions */}
                  <div className="text-end" style={{ minWidth: "220px" }}>
                    <img
                      src={
                        job.company_logo
                          ? job.company_logo.startsWith("http")
                            ? job.company_logo
                            : `http://127.0.0.1:8000${job.company_logo}`
                          : "https://via.placeholder.com/64"
                      }
                      alt="company"
                      width="64"
                      height="64"
                      style={{
                        borderRadius: "12px",
                        objectFit: "cover",
                        border: "1px solid #eee",
                      }}
                    />

                    <div className="d-grid gap-2 mt-3">
                      <button
                        className="btn btn-success"
                        onClick={applyJob}
                        disabled={applying}
                        style={{ fontWeight: 600 }}
                      >
                        {applying ? "Applying..." : "Apply Now"}
                      </button>

                      <button
                        className="btn btn-outline-primary"
                        onClick={shareJob}
                      >
                        Share Job
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* ✅ Description */}
                <h5 className="fw-bold mb-2">Job Description</h5>
                <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                  {job.description || "No description available."}
                </p>
              </div>
            </div>

            {/* ✅ Small help card */}
            <div className="alert alert-light border mt-3">
              <small className="text-muted">
                After applying, employer will receive your seeker profile details
                (skills, phone, resume, etc.) in their Applicants section.
              </small>
            </div>
          </>
        )}
      </div>
    </>
  );
}