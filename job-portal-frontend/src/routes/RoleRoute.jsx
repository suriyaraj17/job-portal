import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, role }) {
  const savedRole = localStorage.getItem("role");

  if (savedRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
