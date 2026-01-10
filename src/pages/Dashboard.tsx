import { useState, useEffect } from "react";
import Navbar from "../pages/Navbar";
import AccountCard from  "../pages/AccountCard";
import TransferForm from "../pages/TransferForm";
import { getMyTransactions, type Transaction } from "../api/transactions";

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getMyTransactions();
      
      console.log("📊 Transactions response:", data);
      
      // Ensure we have an array
      const transactionsArray = Array.isArray(data) ? data : [];
      setTransactions(transactionsArray);
      setError(null);
    } catch (err: any) {
      console.error("❌ Error loading transactions:", err);
      setError("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        <AccountCard />
        <TransferForm onSuccess={fetchTransactions} />

        <div className="transactions-section">
          <h2>Recent Transactions</h2>
          
          {loading && <p className="loading">Loading transactions...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <>
              {transactions.length === 0 ? (
                <p className="no-data">No transactions yet.</p>
              ) : (
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>From Account</th>
                      <th>To Account</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.fromAccountNumber || 'N/A'}</td>
                        <td>{tx.toAccountNumber || 'N/A'}</td>
                        <td>${tx.amount?.toFixed(2) || '0.00'}</td>
                        <td>{tx.status || 'UNKNOWN'}</td>
                        <td>{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;