import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function EmployerProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false); // ✅ NEW
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/accounts/profile/employer/")
      .then(res => {
        setProfile(res.data);
        setForm(res.data);
        setLogoPreview(res.data.company_logo);
      })
      .catch(() => setErr("Failed to load profile"));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = e => {
    const file = e.target.files[0];
    setForm({ ...form, company_logo: file });
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false); // new logo selected
  };

  // ✅ REMOVE LOGO FUNCTION
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setForm({ ...form, company_logo: null });
    setRemoveLogo(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    const data = new FormData();

    // Editable fields
    data.append("company_name", form.company_name || "");
    data.append("website", form.website || "");
    data.append("phone", form.phone || "");
    data.append("description", form.description || "");
    data.append("address", form.address || "");

    // If new logo uploaded
    if (form.company_logo instanceof File) {
      data.append("company_logo", form.company_logo);
    }

    // If logo removed
    if (removeLogo) {
      data.append("company_logo", "");
    }

    try {
      await api.put("/accounts/profile/employer/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("Profile updated successfully ✅");

      const res = await api.get("/accounts/profile/employer/");
      setProfile(res.data);
      setForm(res.data);
      setLogoPreview(res.data.company_logo);
      setRemoveLogo(false);

    } catch (error) {
      console.log(error.response?.data);
      setErr("Update failed ❌");
    }
  };

  if (!profile) return <p className="text-center mt-4">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: "720px" }}>
        <h4 className="fw-bold mb-3">Company Profile</h4>

        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
          <div className="text-center mb-3">
            <img
              src={
               logoPreview
                 ? `${import.meta.env.VITE_API_URL}$
              {logoPreview}`
                  : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              
              alt="logo"
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "12px",
                objectFit: "cover"
              }}
            />

            <input
              type="file"
              className="form-control mt-2"
              onChange={handleLogoChange}
            />

            {/* ✅ Remove Logo Button */}
            {logoPreview && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger mt-2"
                onClick={handleRemoveLogo}
              >
                Remove Logo
              </button>
            )}
          </div>

          <input
            name="company_name"
            value={form.company_name || ""}
            onChange={handleChange}
            className="form-control mb-3"
            placeholder="Company Name"
          />

          <input
            name="website"
            value={form.website || ""}
            onChange={handleChange}
            className="form-control mb-3"
            placeholder="Company Website"
          />

          <input
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
            className="form-control mb-3"
            placeholder="Phone"
          />

          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            className="form-control mb-3"
            placeholder="Company Description"
          />

          <input
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            className="form-control mb-3"
            placeholder="Company Address"
          />

          <button className="btn btn-dark w-100">Save Changes</button>
        </form>
      </div>
    </>
  );
}