import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // STEP 1 → Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      await api.post("/accounts/password-reset/request-otp/", { email });
      setMsg("OTP sent to your email 📩");
      setStep(2);
    } catch (error) {
      setErr(error.response?.data?.error || "Failed to send OTP");
    }
  };

  // STEP 2 → Verify OTP & Reset Password
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      await api.post("/accounts/password-reset/verify-otp/", {
        email,
        otp,
        new_password: newPassword,
      });

      setMsg("Password reset successful ✅ Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErr(error.response?.data?.error || "Invalid OTP or expired");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "420px" }}>
      <div className="card p-4 shadow-sm">
        <h4 className="mb-3 text-center">Forgot Password</h4>

        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-danger">{err}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-dark w-100">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <input
              className="form-control mb-2"
              placeholder="Enter OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="btn btn-success w-100">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
}