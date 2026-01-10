import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { 
  getDashboardStats, 
  getPendingEscrowOrders,
  getOrdersByStatus,
  getAllUsers,
  getAllTransactions,
  type DashboardStats 
} from "../api/admin";
import { releaseEscrow, refundOrder } from "../api/orders";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'transactions'>('overview');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, usersData, transactionsData] = await Promise.all([
        getDashboardStats(),
        getPendingEscrowOrders(),
        getAllUsers(),
        getAllTransactions(),
      ]);
      setStats(statsData);
      setPendingOrders(ordersData);
      setAllUsers(usersData);
      setRecentTransactions(transactionsData.slice(0, 10)); // Last 10 transactions
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReleaseEscrow = async (orderId: number) => {
    if (!window.confirm("Release escrow and pay seller?")) return;
    
    setActionLoading(orderId);
    try {
      await releaseEscrow(orderId);
      alert("Escrow released successfully! Seller has been paid.");
      fetchData(); // Refresh data
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to release escrow");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (orderId: number) => {
    if (!window.confirm("Refund this order? Money will be returned to buyer.")) return;
    
    setActionLoading(orderId);
    try {
      await refundOrder(orderId);
      alert("Order refunded successfully! Money returned to buyer.");
      fetchData(); // Refresh data
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to refund order");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <p className="loading">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>⚙️ Admin Dashboard</h1>

        {error && (
          <div className="error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          borderBottom: "2px solid #eee",
          paddingBottom: "10px"
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: "10px 20px",
              background: activeTab === 'overview' ? '#667eea' : 'transparent',
              color: activeTab === 'overview' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeTab === 'overview' ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: "10px 20px",
              background: activeTab === 'orders' ? '#667eea' : 'transparent',
              color: activeTab === 'orders' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeTab === 'orders' ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            📦 Orders ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: "10px 20px",
              background: activeTab === 'users' ? '#667eea' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeTab === 'users' ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            👥 Users ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            style={{
              padding: "10px 20px",
              background: activeTab === 'transactions' ? '#667eea' : 'transparent',
              color: activeTab === 'transactions' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeTab === 'transactions' ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            💳 Transactions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* Stats Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "40px"
            }}>
              <div className="stat-card">
                <div className="stat-value">{stats.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#f39c12' }}>
                  ${stats.pendingEscrow.toFixed(2)}
                </div>
                <div className="stat-label">Pending Escrow</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#e74c3c' }}>
                  ${stats.totalRefunded.toFixed(2)}
                </div>
                <div className="stat-label">Total Refunded</div>
              </div>
            </div>

            {/* Orders by Status */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Orders by Status</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px'
              }}>
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} style={{
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Quick Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#666' }}>Pending Escrow Orders:</span>
                  <span style={{ fontWeight: '600', color: '#f39c12' }}>{pendingOrders.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#666' }}>Platform Users:</span>
                  <span style={{ fontWeight: '600', color: '#667eea' }}>{allUsers.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: '#666' }}>Recent Transactions:</span>
                  <span style={{ fontWeight: '600', color: '#667eea' }}>{recentTransactions.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="transactions-section">
            <h2>Orders Pending Escrow Release ({pendingOrders.length})</h2>
            
            {pendingOrders.length === 0 ? (
              <div style={{
                background: 'white',
                padding: '60px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <p className="no-data">✅ No orders pending escrow release</p>
                <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>
                  All orders have been processed or there are no pending payments.
                </p>
              </div>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user?.name || 'N/A'}</td>
                      <td>{order.seller?.name || 'N/A'}</td>
                      <td style={{ fontWeight: '600' }}>${order.total.toFixed(2)}</td>
                      <td>
                        <span style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: "#f39c12",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: '600'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: order.paymentStatus === 'PAID' ? '#3498db' : '#95a5a6',
                          color: "white",
                          fontSize: "12px",
                          fontWeight: '600'
                        }}>
                          {order.paymentStatus || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleReleaseEscrow(order.id)}
                            disabled={actionLoading === order.id}
                            className="btn-primary"
                            style={{ 
                              padding: "8px 12px", 
                              fontSize: "12px",
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {actionLoading === order.id ? "⏳" : "✅ Release"}
                          </button>
                          <button
                            onClick={() => handleRefund(order.id)}
                            disabled={actionLoading === order.id}
                            className="btn-remove"
                            style={{ 
                              padding: "8px 12px", 
                              fontSize: "12px",
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {actionLoading === order.id ? "⏳" : "↩️ Refund"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="transactions-section">
            <h2>Platform Users ({allUsers.length})</h2>
            
            {allUsers.length === 0 ? (
              <p className="no-data">No users found</p>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Total Balance</th>
                    <th>Accounts</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td style={{ fontWeight: '600' }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: user.role === 'ADMIN' ? '#e74c3c' : '#3498db',
                          color: "white",
                          fontSize: "12px",
                          fontWeight: '600'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#27ae60' }}>
                        ${user.totalBalance.toFixed(2)}
                      </td>
                      <td>{user.accountCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="transactions-section">
            <h2>Recent Transactions</h2>
            
            {recentTransactions.length === 0 ? (
              <p className="no-data">No transactions yet</p>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>From Account</th>
                    <th>To Account</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>#{tx.id}</td>
                      <td>{tx.fromAccountNumber || 'Escrow'}</td>
                      <td>{tx.toAccountNumber || 'Escrow'}</td>
                      <td style={{ fontWeight: '600', color: '#27ae60' }}>
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {tx.type || 'TRANSFER'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: tx.status === 'COMPLETED' ? '#27ae60' : '#95a5a6',
                          color: "white",
                          fontSize: "12px",
                          fontWeight: '600'
                        }}>
                          {tx.status}
                        </span>
                      </td>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;