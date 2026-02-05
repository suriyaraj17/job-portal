import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Applicants() {
  const { jobId } = useParams();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}/applicants/`);

        if (Array.isArray(res.data)) {
          setApps(res.data);
        } else if (Array.isArray(res.data.results)) {
          setApps(res.data.results);
        } else {
          setApps([]);
        }
      } catch (err) {
        console.error("Failed to load applicants", err);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/jobs/applications/${id}/status/`, {
        status: status,
      });

      setApps((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: status } : a
        )
      );
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <h3>Applicants</h3>

        {loading && <p>Loading applicants...</p>}

        {!loading && apps.length === 0 && (
          <p className="text-muted">No applicants yet.</p>
        )}

        {!loading &&
          Array.isArray(apps) &&
          apps.map((app) => (
            <div key={app.id} className="card mb-3">
              <div className="card-body">
                <h5>
                  Candidate: {app.seeker?.user?.email || "N/A"}
                </h5>

                <p className="mb-1">
                  Status: <strong>{app.status}</strong>
                </p>

                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => updateStatus(app.id, "shortlisted")}
                  >
                    Shortlist
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => updateStatus(app.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>

                {app.cover_letter && (
                  <p className="mt-2">
                    <strong>Cover Letter:</strong>
                    <br />
                    {app.cover_letter}
                  </p>
                )}

                <Link
                  to={`/employer/candidate/${app.seeker.id || app.seeker}`}
                  className="btn btn-sm btn-outline-primary mt-2"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}