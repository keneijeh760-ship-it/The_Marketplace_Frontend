import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
}

export const ProtectedRoute = ({ children }: Props) => {
  const auth = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
