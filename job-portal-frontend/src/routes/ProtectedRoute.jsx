import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

export default function ProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const detectRole = async () => {
      const token = localStorage.getItem("access");

      // ❌ Not logged in
      if (!token) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // ✅ Try employer profile FIRST
        await api.get("/accounts/profile/employer/");
        setUserRole("employer");
      } catch {
        try {
          // ✅ Then try seeker
          await api.get("/accounts/profile/seeker/");
          setUserRole("seeker");
        } catch {
          setUserRole(null);
        }
      } finally {
        setLoading(false);
      }
    };

    detectRole();
  }, []);

  // ⏳ Still checking
  if (loading) return <div className="text-center mt-5">Loading...</div>;

  // ❌ Not logged in
  if (!userRole) return <Navigate to="/login" />;

  // ❌ Role mismatch
  if (role && userRole !== role) return <Navigate to="/login" />;

  return children;
}