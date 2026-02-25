import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function EditSeekerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    skills: "",
    experience_years: 0,
    college_name: "",
    degree: "",
    cgpa: "",
    passed_out_year: "",
  });

  const [resume, setResume] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // ✅ Load profile
  const fetchProfile = async () => {
    try {
      const res = await api.get("/accounts/profile/seeker/");
      setProfile(res.data);

      setForm({
        skills: res.data.skills || "",
        experience_years: res.data.experience_years ?? 0,
        college_name: res.data.college_name || "",
        degree: res.data.degree || "",
        cgpa: res.data.cgpa || "",
        passed_out_year: res.data.passed_out_year || "",
      });
    } catch (e) {
      setErr("Failed to load profile ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  // ✅ Save profile
const handleSave = async () => {
  setMsg("");
  setErr("");

  try {
    const formData = new FormData();

    // text fields
    formData.append("skills", form.skills);
    formData.append("experience_years", form.experience_years);
    formData.append("college_name", form.college_name);
    formData.append("degree", form.degree);
    formData.append("cgpa", form.cgpa);
    formData.append("passed_out_year", form.passed_out_year);

    // file fields
    if (resume) {
      formData.append("resume", resume);
    }

    if (profilePic) {
      formData.append("profile_pic", profilePic);
    }

    await api.put("/accounts/profile/seeker/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMsg("Profile saved successfully ✅");
    setResume(null);
    setProfilePic(null);

    fetchProfile();

  } catch (error) {
    console.log(error.response?.data);
    setErr("Profile save failed ❌");
  }
};

  // ✅ Delete Resume
  const handleDeleteResume = async () => {
    setMsg("");
    setErr("");

    try {
      await api.put("/accounts/profile/seeker/", { resume: null });
      setMsg("Resume removed ✅");
      fetchProfile();
    } catch {
      setErr("Failed to delete resume ❌");
    }
  };

  // ✅ Delete Profile Pic
  const handleDeleteProfilePic = async () => {
    setMsg("");
    setErr("");

    try {
      await api.put("/accounts/profile/seeker/", { profile_pic: null });
      setMsg("Profile picture removed ✅");
      fetchProfile();
    } catch {
      setErr("Failed to delete profile picture ❌");
    }
  };

  const experienceText =
    Number(form.experience_years) === 0
      ? "Fresher"
      : `${form.experience_years} years`;

  // ✅ Loading UI
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  // ✅ Profile not found
  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <p className="text-danger">Profile not found ❌</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container mt-4" style={{ maxWidth: "900px" }}>
        <h4 className="mb-3">My Profile</h4>

        {err && <div className="alert alert-danger">{err}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            {/* ✅ Top Header */}
            <div className="d-flex justify-content-between align-items-center">
              {/* Left side: profile pic + name */}
              <div className="d-flex align-items-center gap-3">
                <img
                 src={profile.profile_pic}
                  alt="profile"
                  width="70"
                  height="70"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />

                <div>
                  <h5 className="mb-0">
                    {profile?.user?.first_name} {profile?.user?.last_name}
                  </h5>
                  <small className="text-muted">{experienceText}</small>
                </div>
              </div>

              {/* Right side: upload profile pic */}
              <div className="text-end">
                <input
                  type="file"
                  id="picUpload"
                  className="d-none"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files[0])}
                />

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => document.getElementById("picUpload").click()}
                >
                  Upload Pic
                </button>

                {profile.profile_pic && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={handleDeleteProfilePic}
                  >
                    Delete
                  </button>
                )}

                {profilePic && (
                  <small className="text-success d-block mt-1">
                    ✅ {profilePic.name}
                  </small>
                )}
              </div>
            </div>

            <hr className="my-4" />

            {/* ✅ Bio details */}
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label fw-semibold">Skills</label>
                <input
                  className="form-control"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="Eg: Python, Django, SQL"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="form-control"
                  name="experience_years"
                  value={form.experience_years}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Passed Out Year</label>
                <input
                  type="number"
                  className="form-control"
                  name="passed_out_year"
                  value={form.passed_out_year}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">College</label>
                <input
                  className="form-control"
                  name="college_name"
                  value={form.college_name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Degree (UG / PG)</label>
                <input
                  className="form-control"
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  placeholder="Eg: B.Sc / M.Sc / MBA"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="cgpa"
                  value={form.cgpa}
                  onChange={handleChange}
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* ✅ Resume Upload */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Resume</label>

                <input
                  type="file"
                  id="resumeUpload"
                  className="d-none"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                />

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-dark w-100"
                    onClick={() =>
                      document.getElementById("resumeUpload").click()
                    }
                  >
                    Upload Resume
                  </button>

                  {profile.resume && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleDeleteResume}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {resume && (
                  <small className="text-success d-block mt-1">
                    ✅ {resume.name}
                  </small>
                )}

                {profile.resume && !resume && (
                  <small className="d-block mt-2 text-muted">
                    Current:{" "}
                    <a href={profile.resume} target="_blank" rel="noreferrer">
  View / Download
</a>
                  </small>
                )}
              </div>
            </div>

            {/* ✅ Save button */}
            <button className="btn btn-primary mt-4 w-100" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}