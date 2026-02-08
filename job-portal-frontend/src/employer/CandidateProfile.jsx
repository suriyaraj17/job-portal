import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function CandidateProfile() {
  const { seekerId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/jobs/employer/candidate/${seekerId}/`)
      .then((res) => setProfile(res.data))
      .catch(() => console.error("Failed to load candidate profile"))
      .finally(() => setLoading(false));
  }, [seekerId]);

  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <h3>Candidate Profile</h3>

      {!loading && profile && (
  <div className="card">
    <div className="card-body">

      {/* ✅ Name */}
      <h5>{profile.name}</h5>

      {/* ✅ Email */}
      <p><strong>Email:</strong> {profile.email}</p>

      <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>

      <p><strong>Skills:</strong> {profile.skills || "N/A"}</p>

      <p>
        <strong>Experience:</strong>{" "}
        {profile.experience_years === 0
          ? "Fresher"
          : `${profile.experience_years} years`}
      </p>

      <p><strong>College:</strong> {profile.college_name || "N/A"}</p>

      <p><strong>Degree:</strong> {profile.degree || "N/A"}</p>

      <p><strong>CGPA:</strong> {profile.cgpa || "N/A"}</p>

      <p><strong>Passed Out Year:</strong> {profile.passed_out_year || "N/A"}</p>

      <p>
        <strong>Resume:</strong>{" "}
        {profile.resume ? (
          <a
          href={`${BASE_URL}${profile.resume}`}

            target="_blank"
            rel="noreferrer"
          >
            View / Download
          </a>
        ) : (
          "Not uploaded"
        )}
      </p>

    </div>
  </div>
)}
      </div>
    </>
  );
}