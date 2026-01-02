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
          The Marketplace
        </h2>
        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            Dashboard
          </Link>
          <Link
            to="/products"
            className={`nav-link ${isActive("/products") ? "active" : ""}`}
          >
            Products
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
            Orders
          </Link>
          {auth.isAdmin() && (
            <Link
              to="/create-user"
              className={`nav-link ${isActive("/create-user") ? "active" : ""}`}
            >
              Create User
            </Link>
          )}
        </div>
      </div>
      <button onClick={handleLogout} className="btn-logout">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;