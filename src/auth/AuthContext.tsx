import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<string | null>(
    localStorage.getItem("role")
  );

  // Fetch user role when token exists
useEffect(() => {
  const fetchUserRole = async () => {
    if (token && !role) {
      try {
        const response = await api.get("/users/me"); // ✅ FIXED
        const userRole = response.data.role;
        setRole(userRole);
        localStorage.setItem("role", userRole);
      } catch (error) {
        console.error("Failed to fetch user role", error);
        logout(); // optional but recommended
      }
    }
  };

  fetchUserRole();
}, [token, role]);


  const login = (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
    setRole(null); // Reset role, will be fetched by useEffect
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  const isAdmin = () => {
    return role === "ADMIN";
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};