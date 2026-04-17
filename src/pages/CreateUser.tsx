import { useState } from "react";
import Navbar from "./Navbar";
import { register as registerApi } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, CheckCircle, AlertCircle } from "lucide-react";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await registerApi({
        name,
        email,
        password,
        accountNumber: Number(accountNumber),
        bankName,
        initialBalance: Number(initialBalance),
      });

      setSuccess("User created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setAccountNumber("");
      setBankName("");
      setInitialBalance("");
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
      setError(message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketplace-shell">
      <Navbar />

      <div className="marketplace-container py-8">
        <div className="mb-6 flex items-center gap-3">
          <UserPlus className="h-6 w-6 text-neutral-400" />
          <h1 className="text-2xl font-bold text-white">Create New User</h1>
        </div>

        <div className="mx-auto max-w-lg rounded-xl border border-white/8 bg-[#141414] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cu-name">Full Name</Label>
              <Input
                id="cu-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cu-email">Email</Label>
              <Input
                id="cu-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cu-password">Password</Label>
              <Input
                id="cu-password"
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
                  <Label htmlFor="cu-bank">Bank Name</Label>
                  <Input
                    id="cu-bank"
                    type="text"
                    placeholder="Chase, Wells Fargo, etc."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cu-acct">Account #</Label>
                    <Input
                      id="cu-acct"
                      type="number"
                      placeholder="1234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cu-balance">Initial Balance</Label>
                    <Input
                      id="cu-balance"
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

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" variant="buy" className="w-full" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
