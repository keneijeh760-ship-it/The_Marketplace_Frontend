import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  getDashboardStats,
  getPendingEscrowOrders,
  getAllUsers,
  getAllTransactions,
  type AdminOrder,
  type AdminTransaction,
  type DashboardStats,
  type UserBalance,
} from "../api/admin";
import { releaseEscrow, refundOrder } from "../api/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Settings,
  BarChart3,
  Package,
  Users,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type Tab = "overview" | "orders" | "users" | "transactions";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [allUsers, setAllUsers] = useState<UserBalance[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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
      setRecentTransactions(transactionsData.slice(0, 10));
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
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || "Failed to release escrow");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (orderId: number) => {
    if (!window.confirm("Refund this order?")) return;
    setActionLoading(orderId);
    try {
      await refundOrder(orderId);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || "Failed to refund");
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof BarChart3; count?: number }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "orders", label: "Orders", icon: Package, count: pendingOrders.length },
    { id: "users", label: "Users", icon: Users, count: allUsers.length },
    { id: "transactions", label: "Transactions", icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="marketplace-shell">
        <Navbar />
        <div className="marketplace-container py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-shell">
      <Navbar />

      <div className="marketplace-container py-8">
        <div className="mb-6 flex items-center gap-3">
          <Settings className="h-6 w-6 text-neutral-400" />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2 border-b border-white/8 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-1 rounded-full px-2 py-0.5 text-xs",
                    activeTab === tab.id ? "bg-white/20" : "bg-white/10"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "blue" },
                { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "green" },
                { label: "Pending Escrow", value: `$${stats.pendingEscrow.toFixed(2)}`, icon: AlertCircle, color: "yellow" },
                { label: "Total Users", value: stats.totalUsers, icon: Users, color: "purple" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl border border-white/8 bg-[#141414] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{stat.label}</span>
                      <Icon className={cn("h-5 w-5", `text-${stat.color}-400`)} />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">{stat.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Orders by Status</h3>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="rounded-lg bg-neutral-900/50 p-4 text-center">
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-neutral-500">{status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="rounded-xl border border-white/8 bg-[#141414]">
            <div className="border-b border-white/8 p-5">
              <h3 className="text-lg font-semibold text-white">Pending Escrow Orders</h3>
            </div>
            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-4 text-neutral-400">No pending escrow orders</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/8 bg-neutral-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Order</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Buyer</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Seller</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Total</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 font-medium text-white">#{order.id}</td>
                        <td className="px-4 py-3 text-neutral-300">{order.user?.name || "N/A"}</td>
                        <td className="px-4 py-3 text-neutral-300">{order.seller?.name || "N/A"}</td>
                        <td className="px-4 py-3 font-medium text-white">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="pending">{order.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="buy"
                              disabled={actionLoading === order.id}
                              onClick={() => handleReleaseEscrow(order.id)}
                            >
                              Release
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actionLoading === order.id}
                              onClick={() => handleRefund(order.id)}
                            >
                              Refund
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="rounded-xl border border-white/8 bg-[#141414]">
            <div className="border-b border-white/8 p-5">
              <h3 className="text-lg font-semibold text-white">Platform Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/8 bg-neutral-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-400">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-400">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-400">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-400">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-neutral-400">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.userId} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-neutral-500">{user.userId}</td>
                      <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                      <td className="px-4 py-3 text-neutral-300">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-green-400">${user.totalBalance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="rounded-xl border border-white/8 bg-[#141414]">
            <div className="border-b border-white/8 p-5">
              <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">No transactions yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/8 bg-neutral-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">ID</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">From</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">To</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-neutral-500">#{tx.id}</td>
                        <td className="px-4 py-3 text-neutral-300">{tx.fromAccountNumber || "Escrow"}</td>
                        <td className="px-4 py-3 text-neutral-300">{tx.toAccountNumber || "Escrow"}</td>
                        <td className="px-4 py-3 font-medium text-white">${tx.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={tx.status === "SUCCESS" ? "success" : "secondary"}>{tx.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-neutral-500">{new Date(tx.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
