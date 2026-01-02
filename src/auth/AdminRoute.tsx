import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
}

export const AdminRoute = ({ children }: Props) => {
  const auth = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (!auth.isAdmin()) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>403 - Forbidden</h1>
        <p>You don't have permission to access this page.</p>
        <a href="/" style={{ color: "#667eea" }}>Go to Dashboard</a>
      </div>
    );
  }

  return children;
};