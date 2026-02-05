import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function AppliedJobs() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/jobs/applications/");
        setApplications(res.data);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "applied":
        return "secondary";
      case "shortlisted":
        return "primary";
      case "hired":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "dark";
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-4" style={{ maxWidth: "980px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">My Applications</h4>
          <span className="badge text-bg-light border">
            {applications.length} Applied
          </span>
        </div>

        {loading && <p className="text-muted">Loading applications...</p>}

        {!loading && applications.length === 0 && (
          <div className="text-center text-muted py-5">
            <h6>No applications yet</h6>
            <small>Start applying to jobs to see them here</small>
          </div>
        )}

        <div className="d-flex flex-column gap-3">
          {applications.map((app) => (
            <div key={app.application_id} className="card mb-3">
              <div className="card-body d-flex justify-content-between align-items-start flex-wrap gap-3">
                
                {/* LEFT */}
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <h6 className="fw-bold mb-1" style={{ fontSize: "18px" }}>
                    {app.job_title}
                  </h6>

                  <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
                    <span className="fw-semibold text-dark">
                      {app.company_name}
                    </span>
                  </p>

                  <small className="text-muted">
                    Application ID: {app.application_id}
                  </small>
                </div>

                {/* RIGHT */}
                <div className="text-end">
                  <span
                    className={`badge bg-${statusColor(app.status)} mb-3`}
                    style={{ fontSize: "13px" }}
                  >
                    {app.status.toUpperCase()}
                  </span>

                  <div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/seeker/jobs/${app.job_id}`)}
                    >
                      View Job
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <style>
          {`
            .card:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
            }
          `}
        </style>
      </div>
    </>
  );
}