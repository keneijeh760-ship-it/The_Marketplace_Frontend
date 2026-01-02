import { useState } from "react";
import { transferMoney } from "../api/transfer";

interface Props {
  onSuccess: () => void;
}

const TransferForm = ({ onSuccess }: Props) => {
  const [fromAccountNumber, setFromAccountNumber] = useState("");  // ✅ CHANGED
  const [toAccountNumber, setToAccountNumber] = useState("");      // ✅ CHANGED
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await transferMoney({
        fromAccountNumber: Number(fromAccountNumber),  // ✅ CHANGED
        toAccountNumber: Number(toAccountNumber),      // ✅ CHANGED
        amount: Number(amount),
      });
      setSuccess("Transfer successful!");
      setFromAccountNumber("");
      setToAccountNumber("");
      setAmount("");
      onSuccess(); // Refresh transactions
    } catch (err: any) {
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError("Transfer failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form-container">
      <h2>Transfer Money</h2>
      <form onSubmit={handleSubmit} className="transfer-form">
        <div className="form-group">
          <label>From Account Number</label>
          <input
            type="number"
            placeholder="Enter your account number"
            value={fromAccountNumber}
            onChange={(e) => setFromAccountNumber(e.target.value)}
            required
          />
          <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
            Use your account number (not ID)
          </small>
        </div>

        <div className="form-group">
          <label>To Account Number</label>
          <input
            type="number"
            placeholder="Enter recipient account number"
            value={toAccountNumber}
            onChange={(e) => setToAccountNumber(e.target.value)}
            required
          />
          <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
            Recipient's account number
          </small>
        </div>

        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Processing..." : "Transfer"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default TransferForm;