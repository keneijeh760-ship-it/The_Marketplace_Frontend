import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ShoppingBag, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginApi({ email, password });
      auth.login(response.token);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketplace-shell flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2">
          <Store className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold text-white">Marketplace</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Buy and sell with confidence
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of users trading securely with our escrow-protected marketplace.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: ShoppingBag, label: "Browse Products" },
              { icon: Lock, label: "Secure Payments" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                  <Icon className="h-6 w-6 text-blue-200" />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-blue-200">
          Protected by industry-standard security
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Store className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">Marketplace</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#141414] p-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-neutral-500">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" variant="buy" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
