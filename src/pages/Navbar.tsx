import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShoppingCart, User, Search, Package, Store, Settings, LogOut, ChevronDown, Wallet } from "lucide-react";
import { getCart } from "../api/Cart";

const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchFromUrl = new URLSearchParams(location.search).get("search") || "";

  useEffect(() => {
    if (auth.token) {
      getCart()
        .then((items) => setCartCount(items.length))
        .catch(() => setCartCount(0));
    }
  }, [auth.token, location.pathname]);

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const trimmed = String(formData.get("search") || "").trim();
    if (!trimmed) {
      navigate("/products");
      return;
    }
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0a0a]/95 backdrop-blur-xl">
      <div className="marketplace-container">
        <div className="flex h-16 items-center gap-4">
          <button
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-80"
            onClick={() => navigate("/")}
            type="button"
          >
            <Store className="h-6 w-6 text-blue-500" />
            <span className="hidden sm:inline">Marketplace</span>
          </button>

          <form onSubmit={handleSearch} className="mx-4 flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                name="search"
                type="text"
                key={location.search}
                defaultValue={searchFromUrl}
                placeholder="Search for anything..."
                className="search-input"
              />
            </div>
          </form>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors md:block",
                isActive("/") ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
              )}
            >
              Wallet
            </Link>

            <Link
              to="/products"
              className={cn(
                "hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors md:block",
                isActive("/products") ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
              )}
            >
              Search
            </Link>

            <Link
              to="/orders"
              className={cn(
                "hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors md:block",
                isActive("/orders") ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
              )}
            >
              Orders
            </Link>

            <Link
              to="/cart"
              className={cn(
                "relative rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white",
                isActive("/cart") && "bg-white/10 text-white"
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 rounded-lg px-2 py-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <User className="h-5 w-5" />
                <ChevronDown className="h-3 w-3" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#141414] py-2 shadow-2xl">
                    {auth.role && (
                      <div className="border-b border-white/10 px-4 py-2 mb-2">
                        <Badge variant={auth.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                          {auth.role}
                        </Badge>
                      </div>
                    )}

                    <Link
                      to="/"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                    >
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>

                    <Link
                      to="/products"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                    >
                      <Store className="h-4 w-4" />
                      Sell
                    </Link>

                    {auth.isAdmin() && (
                      <>
                        <div className="my-2 border-t border-white/10" />
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                        >
                          <Settings className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/create-user"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                        >
                          <User className="h-4 w-4" />
                          Create User
                        </Link>
                      </>
                    )}

                    <div className="my-2 border-t border-white/10" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
