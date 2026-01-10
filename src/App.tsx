import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./auth/AdminRoute";
import { useWebSocket } from "./pages/hooks/useWebSocket";
import { NotificationToast } from "./pages//NotificationToast";
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
  const { userId } = useAuth();
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
      </Routes>

      {/* Real-time notifications */}
      <NotificationToast 
        notifications={visibleNotifications} 
        onDismiss={dismissNotification}
      />

      {/* Connection indicator */}
      {connected && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '8px 12px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          🟢 Live
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