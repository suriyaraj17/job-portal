import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/token/", {
        username: email,
        password: password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // ✅ Role detection
      try {
        await api.get("/accounts/profile/seeker/");
        localStorage.setItem("role", "seeker");
        navigate("/seeker/dashboard", { replace: true });
        return;
      } catch {}

      try {
        await api.get("/accounts/profile/employer/");
        localStorage.setItem("role", "employer");
        navigate("/employer/dashboard", { replace: true });
        return;
      } catch {}

      setError("Login failed. Profile not found.");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Login</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100 mb-3">Login</button>

        <div className="text-end mb-3">
  <a href="/forgot-password" style={{ fontSize: "14px" }}>
    Forgot Password?
  </a>
</div>

        <div className="text-center">
          <p className="mb-1">New user?</p>
          <Link to="/register/seeker" className="d-block">
            Register as Job Seeker
          </Link>
          <Link to="/register/employer" className="d-block">
            Register as Employer
          </Link>
        </div>
      </form>
    </div>
  );
}