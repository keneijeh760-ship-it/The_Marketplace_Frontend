import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./auth/AdminRoute";
import { useWebSocket } from "./pages/hooks/useWebSocket";
import { NotificationToast } from "./pages/NotificationToast";
import CreateUser from "./pages/CreateUser";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";

// Inner component that has access to auth
function AppRoutes() {
  const { userId, token } = useAuth();
  const { connected, notifications } = useWebSocket(userId);
  const [visibleNotifications, setVisibleNotifications] = useState(notifications);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const dismissNotification = (index: number) => {
    setVisibleNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/create-user"
          element={
            <AdminRoute>
              <CreateUser />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
      </Routes>

      {/* Real-time notifications */}
      <NotificationToast 
        notifications={visibleNotifications} 
        onDismiss={dismissNotification}
      />

      {connected && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-green-500/30 bg-[#141414] px-3 py-1.5 text-xs font-medium text-green-400 shadow-lg">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" aria-hidden />
          Connected
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;