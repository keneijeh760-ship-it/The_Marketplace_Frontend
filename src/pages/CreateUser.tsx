import { useState } from "react";
import Navbar from "../pages/Navbar";
import { api } from "../api/client";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
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
      await api.post("/users", {
        name,
        email,
        password,
        accountNumber: Number(accountNumber),
        initialBalance: Number(initialBalance),
      });

      setSuccess("User created successfully!");
      
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setAccountNumber("");
      setInitialBalance("");
    } catch (err: any) {
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError("Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Create New User</h1>

        <div className="transfer-form-container">
          <form onSubmit={handleSubmit} className="transfer-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="user@example.com"
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

            <div className="form-group">
              <label>Account Number</label>
              <input
                type="number"
                placeholder="1001234567"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
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
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateUser;