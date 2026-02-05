import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
  });

  useEffect(() => {
    api.get(`/jobs/employer/jobs/${id}/`).then((res) => {
      setForm(res.data);
    });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/jobs/employer/jobs/${id}/`, form);
      alert("Job updated successfully");
      navigate("/employer/dashboard");
    } catch {
      alert("Failed to update job");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: "600px" }}>
        <h3>Edit Job</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-2"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            className="form-control mb-2"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            className="form-control mb-2"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <input
            className="form-control mb-3"
            name="salary"
            value={form.salary || ""}
            onChange={handleChange}
            placeholder="Salary (optional)"
          />

          <button className="btn btn-primary">Update Job</button>
        </form>
      </div>
    </>
  );
}