import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title" onClick={() => navigate("/")}>
          🏪 The Marketplace
        </h2>
        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/products"
            className={`nav-link ${isActive("/products") ? "active" : ""}`}
          >
            🛍️ Products
          </Link>
          <Link
            to="/cart"
            className={`nav-link ${isActive("/cart") ? "active" : ""}`}
          >
            🛒 Cart
          </Link>
          <Link
            to="/orders"
            className={`nav-link ${isActive("/orders") ? "active" : ""}`}
          >
            📦 Orders
          </Link>
          
          {/* Admin Links - Only visible to admins */}
          {auth.isAdmin() && (
            <>
              <Link
                to="/admin"
                className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                style={{
                  background: isActive("/admin") ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)',
                  borderLeft: '3px solid #e74c3c',
                }}
              >
                ⚙️ Admin
              </Link>
              <Link
                to="/create-user"
                className={`nav-link ${isActive("/create-user") ? "active" : ""}`}
              >
                ➕ Create User
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Role Badge */}
        {auth.role && (
          <span style={{
            padding: '6px 12px',
            background: auth.role === 'ADMIN' ? '#e74c3c' : '#667eea',
            color: 'white',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {auth.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
          </span>
        )}
        
        <button onClick={handleLogout} className="btn-logout">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
