import { useState } from "react";
import api from "../api/axios";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/accounts/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setMessage("Password updated successfully. Please login again.");
      localStorage.clear(); // optional but recommended
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5>Change Password</h5>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="form-control mb-2"
            placeholder="Current Password"
            required
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-2"
            placeholder="New Password"
            required
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Confirm New Password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="btn btn-warning w-100">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}