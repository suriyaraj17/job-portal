import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RegisterSeeker() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
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
      await api.post("/accounts/register/seeker/", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });

      alert("Registration successful. Please login.");
      navigate("/login");

    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <h3 className="text-center mb-3">Job Seeker Signup</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="first_name" placeholder="First Name" required onChange={handleChange} />
        <input className="form-control mb-2" name="last_name" placeholder="Last Name" required onChange={handleChange} />
        <input type="email" className="form-control mb-2" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" className="form-control mb-2" name="password" placeholder="Password" required onChange={handleChange} />
        <input type="password" className="form-control mb-3" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} />
        <button className="btn btn-success w-100">Register</button>
      </form>
    </div>
  );
}
