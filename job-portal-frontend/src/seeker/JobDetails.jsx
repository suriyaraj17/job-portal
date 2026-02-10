
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_URL;


export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const role = localStorage.getItem("role"); // assuming you store role

  useEffect(() => {
    api.get(`/jobs/${id}/`)
      .then(res => setJob(res.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post(`/jobs/${id}/apply/`, {
        cover_letter: "I am interested in this opportunity."
      });
      alert("Application submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "You may have already applied.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading job details...</p>;
  if (!job) return <p className="text-center mt-4 text-danger">Job not found</p>;

  return (
    <>
      <Navbar />

      <div className="container mt-4" style={{ maxWidth: "1000px" }}>
        <div className="row g-4">

          {/* LEFT SIDE — JOB DETAILS */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-4">

              <h3 className="fw-bold mb-2">{job.title}</h3>

              <div className="d-flex align-items-center gap-2 mb-3">
                <img
  src={
    logoPreview
      ? logoPreview
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  }
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
                  <div className="fw-semibold">{job.company_name}</div>
                  <div className="text-muted" style={{ fontSize: "14px" }}>
                    📍 {job.location || "N/A"}
                  </div>
                </div>
              </div>

              {job.salary && (
                <div className="mb-3 text-success fw-semibold fs-5">
                  Salary: {job.salary}
                </div>
              )}

              <hr />

              <h5 className="fw-bold mt-3 mb-2">Job Description</h5>
              <p style={{ lineHeight: "1.7", whiteSpace: "pre-line" }}>{job.description}</p>

              {job.requirements && (
                <>
                  <h5 className="fw-bold mt-4 mb-2">Requirements</h5>
                  <p style={{ lineHeight: "1.7", whiteSpace: "pre-line" }}>{job.requirements}</p>
                </>
              )}

              {/* ✅ APPLY BUTTON */}
              {role === "seeker" && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-primary px-2 py-2 fw-semibold"
                    style={{ borderRadius: "8px", fontSize: "16px" }}
                    onClick={handleApply}
                    disabled={applying}
                  >
                    {applying ? "Applying..." : "Apply for this Job"}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT SIDE — COMPANY DETAILS */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 p-4">

              <h5 className="fw-bold mb-3">About the Company</h5>

              <div className="text-center mb-3">
                <img
                    src={
    logoPreview
      ? logoPreview
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  }
  alt="logo"              
                  alt="logo"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    background: "#fff",
                  }}
                />
              </div>

              <p><strong>Company:</strong> {job.company_name}</p>

              {job.company_address && <p><strong>Address:</strong> {job.company_address}</p>}
              {job.company_phone && <p><strong>Contact:</strong> {job.company_phone}</p>}

              {job.company_website && (
                <p>
                  <strong>Website:</strong>{" "}
                  <a href={job.company_website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </p>
              )}

              {job.company_description && (
                <>
                  <hr />
                  <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
                    {job.company_description}
                  </p>
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}