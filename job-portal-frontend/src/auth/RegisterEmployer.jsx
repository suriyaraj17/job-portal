import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RegisterEmployer() {
  const [form, setForm] = useState({
    company_name: "",
    concern_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/accounts/register/employer/", {
        company_name: form.company_name,
        concern_name: form.concern_name,
        email: form.email,
        password: form.password,
      });

      alert("Employer registered successfully. Please login.");
      navigate("/login");

    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <h3 className="text-center mb-3">Employer Signup</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="company_name" placeholder="Company Name" required onChange={handleChange} />
        <input className="form-control mb-2" name="concern_name" placeholder="Concern Person Name" required onChange={handleChange} />
        <input type="email" className="form-control mb-2" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" className="form-control mb-2" name="password" placeholder="Password" required onChange={handleChange} />
        <input type="password" className="form-control mb-3" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} />
        <button className="btn btn-primary w-100">Register</button>
      </form>
    </div>
  );
}
