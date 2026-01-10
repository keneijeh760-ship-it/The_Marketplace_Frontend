import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: number | null;
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
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem("userId");
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {  // ✅ FIXED: Fetch whenever we have a token
        try {
          const response = await api.get("/users/me");
          const userRole = response.data.role;
          const userIdValue = response.data.id;
          
          console.log("✅ Fetched user data:", { userRole, userIdValue }); // Debug log
          
          setRole(userRole);
          setUserId(userIdValue);
          
          localStorage.setItem("role", userRole);
          localStorage.setItem("userId", String(userIdValue));
        } catch (error) {
          console.error("Failed to fetch user data", error);
          logout();
        }
      }
    };

    fetchUserData();
  }, [token]);

  const login = (newToken: string) => {
    // ✅ FIXED: Clear old data before setting new token
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setRole(null);
    setUserId(null);
    
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  const isAdmin = () => {
    console.log("🔍 Checking isAdmin, role:", role); // Debug log
    return role === "ADMIN";
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};