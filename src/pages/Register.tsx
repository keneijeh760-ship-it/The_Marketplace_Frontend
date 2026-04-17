import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Wallet, Building2, ArrowRight } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [initialBalance, setInitialBalance] = useState("0.00");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await registerApi({
        name,
        email,
        password,
        accountNumber: Number(accountNumber),
        bankName,
        initialBalance: Number(initialBalance),
      });
      auth.login(response.token);
      navigate("/");
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } | string };
        message?: string;
      };
      const message =
        (typeof e.response?.data === "object" && e.response?.data && "message" in e.response.data
          ? e.response.data.message
          : null) ||
        (typeof e.response?.data === "string" ? e.response.data : null) ||
        e.message;
      setError(message || "Registration failed. Please try again.");
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
            Start buying and selling today
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Create your account with a linked payment method for instant transactions.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-4 rounded-xl bg-white/10 p-4">
              <Wallet className="mt-0.5 h-6 w-6 text-blue-200" />
              <div>
                <h3 className="font-semibold text-white">Integrated Wallet</h3>
                <p className="text-sm text-blue-200">Your linked bank account becomes your wallet balance</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl bg-white/10 p-4">
              <Building2 className="mt-0.5 h-6 w-6 text-blue-200" />
              <div>
                <h3 className="font-semibold text-white">Escrow Protection</h3>
                <p className="text-sm text-blue-200">Funds held securely until delivery confirmation</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-blue-200">
          Your financial data is encrypted and secure
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-md py-8">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Store className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">Marketplace</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#141414] p-8">
            <h2 className="text-2xl font-bold text-white">Create account</h2>
            <p className="mt-2 text-sm text-neutral-500">Register and link your payment method</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Payment Account
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      type="text"
                      placeholder="Chase, Wells Fargo, etc."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account #</Label>
                      <Input
                        id="accountNumber"
                        type="number"
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="initialBalance">Initial Balance</Label>
                      <Input
                        id="initialBalance"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" variant="buy" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
