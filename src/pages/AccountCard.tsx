import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "../api/account";

const AccountCard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err: any) {
        setError("Failed to load account information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) return <div className="loading">Loading account info...</div>;
  
  if (error) {
    return (
      <div className="account-card-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!currentUser || !currentUser.accounts || currentUser.accounts.length === 0) {
    return <div className="no-data">No accounts found.</div>;
  }

  return (
    <div className="account-cards">
      <h2>Your Bank Account</h2>
      {currentUser.accounts.map((account) => (
        <div key={account.id} className="account-card">
          <div className="account-info">
            {/* ✅ NEW: Show bank name */}
            {account.bankName && (
              <div className="account-detail">
                <span className="label">Bank:</span>
                <span className="value bank-name">{account.bankName}</span>
              </div>
            )}
            
            <div className="account-detail">
              <span className="label">Account Number:</span>
              <span className="value">{account.accountNumber}</span>
            </div>
            
            <div className="account-detail">
              <span className="label">Balance:</span>
              <span className="value balance">${account.balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountCard;