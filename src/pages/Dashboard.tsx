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
      setTransactions(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to load transactions");
      console.error(err);
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

        {/* Account Information */}
        <AccountCard />

        {/* Transfer Form */}
        <TransferForm onSuccess={fetchTransactions} />

        {/* Transactions List */}
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
                        <td>{tx.fromAccountNumber}</td>
                        <td>{tx.toAccountNumber}</td>
                        <td>${tx.amount.toFixed(2)}</td>
                        <td>{tx.status}</td>
                        <td>{new Date(tx.timestamp).toLocaleString()}</td>
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