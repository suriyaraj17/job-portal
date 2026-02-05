import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function SeekerAccount() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  // phone update
  const [phone, setPhone] = useState("");

  // email update with OTP
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // change password
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Load seeker profile
  const fetchProfile = async () => {
    try {
      const res = await api.get("/accounts/profile/seeker/");
      setProfile(res.data);
      setPhone(res.data.phone || "");
    } catch {
      setErr("Failed to load account details ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Update Phone
  const handleUpdatePhone = async () => {
    setMsg("");
    setErr("");

    if (!phone || phone.length !== 10) {
      setErr("Enter valid 10-digit Indian phone number ❌");
      return;
    }

    try {
      await api.put("/accounts/profile/seeker/", { phone });
      setMsg("Phone number updated successfully ✅");
      fetchProfile();
    } catch {
      setErr("Phone update failed ❌");
    }
  };

  // ✅ Send OTP (for email change)
  const handleSendOtp = async () => {
    setMsg("");
    setErr("");

    if (!newEmail) {
      setErr("Enter new email address ❌");
      return;
    }

    try {
      await api.post("/accounts/otp/send/", { email: newEmail });
      setOtpSent(true);
      setMsg("OTP sent to new email ✅");
    } catch (error) {
      console.log(error?.response?.data);
      setErr("Failed to send OTP ❌");
    }
  };

  // ✅ Verify OTP and update email
  const handleVerifyOtpAndUpdateEmail = async () => {
    setMsg("");
    setErr("");

    if (!otp || otp.length !== 6) {
      setErr("Enter valid 6-digit OTP ❌");
      return;
    }

    try {
      await api.post("/accounts/email/change/", {
        new_email: newEmail,
        otp: otp,
      });

      setMsg("✅ Email updated successfully. Please login again...");

      // reset UI
      setNewEmail("");
      setOtp("");
      setOtpSent(false);

      // logout and redirect
      setTimeout(() => {
        localStorage.clear();
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.log(err.response?.data);
      setErr(err.response?.data?.error || "OTP verification failed ❌");
    }
  };

  // ✅ Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (newPass !== confirmNewPass) {
      setErr("New passwords do not match ❌");
      return;
    }

    try {
      await api.post("/accounts/change-password/", {
        old_password: oldPass,
        new_password: newPass,
      });

      setMsg("Password updated successfully ✅");
      setOldPass("");
      setNewPass("");
      setConfirmNewPass("");
    } catch {
      setErr("Password update failed ❌ (check old password)");
    }
  };

  return (
        <>
          <Navbar />
        
       
    <div className="container mt-4" style={{ maxWidth: "900px" }}>
      <h3 className="mb-3">Account Settings</h3>

      {err && <div className="alert alert-danger">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {loading && <p>Loading...</p>}

      {!loading && profile && (
        <>
          {/* ✅ Account Info */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body">
              <h5 className="mb-3">Account</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Current Email:</strong>{" "}
                    {profile.user?.email || profile.email || "N/A"}
                  </p>

                  <p className="mb-2">
                    <strong>Current Phone:</strong> {profile.phone || "N/A"}
                  </p>
                </div>

                <div className="col-md-6">
                  {/* ✅ Update Phone */}
                  <label className="form-label mb-1 fw-semibold">
                    Update Phone
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      maxLength={10}
                      className="form-control"
                      placeholder="10-digit phone"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleUpdatePhone}
                    >
                      Save
                    </button>
                  </div>

                  {/* ✅ Update Email with OTP */}
                  <div className="mt-3">
                    <label className="form-label mb-1 fw-semibold">
                      Change Email (OTP)
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter new email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />

                    {!otpSent ? (
                      <button
                        type="button"
                        className="btn btn-outline-dark mt-2 w-100"
                        onClick={handleSendOtp}
                      >
                        Send OTP
                      </button>
                    ) : (
                      <div className="mt-2">
                        <input
                          type="text"
                          maxLength={6}
                          className="form-control"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
                        />

                        <button
                          type="button"
                          className="btn btn-success mt-2 w-100"
                          onClick={handleVerifyOtpAndUpdateEmail}
                        >
                          Verify OTP & Update Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Security */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">Security</h5>

              <form onSubmit={handleChangePassword}>
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Old Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Confirm New
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmNewPass}
                      onChange={(e) => setConfirmNewPass(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button className="btn btn-dark mt-3 w-100">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
     </>
     
  );
}