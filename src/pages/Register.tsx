import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountNumber, setAccountNumber] = useState("");        // ✅ NEW
  const [bankName, setBankName] = useState("");                  // ✅ NEW
  const [initialBalance, setInitialBalance] = useState("0.00");  // ✅ NEW
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
        initialBalance: Number(initialBalance)
      });
      auth.login(response.token);
      navigate("/");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* ✅ NEW: Bank Account Details */}
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="number"
              placeholder="1234567890"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              placeholder="Chase Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Initial Balance ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <p className="auth-footer">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;