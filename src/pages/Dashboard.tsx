import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../pages/Navbar";
import AccountCard from "../pages/AccountCard";
import TransferForm from "../pages/TransferForm";
import { getMyTransactions, type Transaction } from "../api/transactions";
import { getCurrentUser, type User } from "../api/account";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ShoppingBag,
  ArrowRight,
  CreditCard,
} from "lucide-react";

function getStatusIcon(status: string) {
  const s = status?.toUpperCase() || "";
  if (s === "SUCCESS" || s === "COMPLETED") return CheckCircle;
  if (s === "PENDING") return Clock;
  return XCircle;
}

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [data, user] = await Promise.all([getMyTransactions(), getCurrentUser()]);
      const transactionsArray = Array.isArray(data) ? data : [];
      setTransactions(transactionsArray);
      setCurrentUser(user);
      setError(null);
    } catch (err: unknown) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const myAccountNumbers = new Set(
    (currentUser?.accounts || []).map((acc) => String(acc.accountNumber)),
  );

  const outgoingTransactions = transactions.filter((tx) =>
    myAccountNumbers.has(String(tx.fromAccountNumber)),
  );
  const incomingTransactions = transactions.filter((tx) =>
    myAccountNumbers.has(String(tx.toAccountNumber)),
  );

  const sentValue = outgoingTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const receivedValue = incomingTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="marketplace-shell">
      <Navbar />

      <div className="marketplace-container py-8">
        <div className="mb-6 flex items-center gap-3">
          <Wallet className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Wallet Home</h1>
            <p className="text-sm text-neutral-500">Send, receive, and monitor activity in real time.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/8 bg-[#141414] p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Received</p>
                <p className="mt-2 text-xl font-semibold text-green-400">+${receivedValue.toFixed(2)}</p>
                <p className="mt-1 text-xs text-neutral-500">{incomingTransactions.length} transfers</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#141414] p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Sent</p>
                <p className="mt-2 text-xl font-semibold text-red-400">-${sentValue.toFixed(2)}</p>
                <p className="mt-1 text-xs text-neutral-500">{outgoingTransactions.length} transfers</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#141414] p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Linked Accounts</p>
                <p className="mt-2 text-xl font-semibold text-white">{currentUser?.accounts?.length || 0}</p>
                <p className="mt-1 text-xs text-neutral-500">Bank-backed wallet rails</p>
              </div>
            </div>

            <AccountCard />

            <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  to="/products"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/50 p-4 transition-colors hover:border-white/20 hover:bg-neutral-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
                    <ShoppingBag className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Browse Products</div>
                    <div className="text-xs text-neutral-500">Find something to buy</div>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-neutral-500" />
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/50 p-4 transition-colors hover:border-white/20 hover:bg-neutral-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15">
                    <Package className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">My Orders</div>
                    <div className="text-xs text-neutral-500">Track your purchases</div>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-neutral-500" />
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/50 p-4 transition-colors hover:border-white/20 hover:bg-neutral-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Checkout Queue</div>
                    <div className="text-xs text-neutral-500">Review pending purchases</div>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-neutral-500" />
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#141414]">
              <div className="flex items-center justify-between border-b border-white/8 p-5">
                <h2 className="text-lg font-semibold text-white">Transaction History</h2>
                <Badge variant="secondary">{transactions.length}</Badge>
              </div>

              <div className="p-5">
                {loading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="skeleton h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-4 w-1/3 rounded" />
                          <div className="skeleton h-3 w-1/4 rounded" />
                        </div>
                        <div className="skeleton h-5 w-20 rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {!loading && !error && transactions.length === 0 && (
                  <div className="py-12 text-center">
                    <Clock className="mx-auto h-12 w-12 text-neutral-700" />
                    <p className="mt-4 text-neutral-400">No transactions yet</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Your transaction history will appear here
                    </p>
                  </div>
                )}

                {!loading && !error && transactions.length > 0 && (
                  <div className="space-y-2">
                    {transactions.slice(0, 10).map((tx) => {
                      const StatusIcon = getStatusIcon(tx.status || "");
                      const isSuccess = tx.status?.toUpperCase() === "SUCCESS";
                      const isOutgoing = myAccountNumbers.has(String(tx.fromAccountNumber));

                      return (
                        <div
                          key={tx.id}
                          className="flex items-center gap-4 rounded-xl border border-white/5 bg-neutral-900/30 p-4 transition-colors hover:border-white/10"
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isOutgoing ? "bg-red-500/15" : "bg-green-500/15"
                          }`}>
                            {isOutgoing ? (
                              <ArrowUpRight className="h-5 w-5 text-red-400" />
                            ) : (
                              <ArrowDownLeft className="h-5 w-5 text-green-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">
                                {isOutgoing ? "Sent" : "Received"}
                              </span>
                              <StatusIcon className={`h-3.5 w-3.5 ${isSuccess ? "text-green-400" : "text-yellow-400"}`} />
                            </div>
                            <p className="text-xs text-neutral-500">
                              {isOutgoing
                                ? `To: ${tx.toAccountNumber || "N/A"}`
                                : `From: ${tx.fromAccountNumber || "N/A"}`}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className={`font-semibold ${isOutgoing ? "text-red-400" : "text-green-400"}`}>
                              {isOutgoing ? "-" : "+"}${tx.amount?.toFixed(2) || "0.00"}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {tx.timestamp
                                ? new Date(tx.timestamp).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <TransferForm onSuccess={fetchTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
