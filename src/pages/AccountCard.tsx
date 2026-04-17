import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "../api/account";
import { Building2, CreditCard, TrendingUp } from "lucide-react";

const AccountCard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err: unknown) {
        setError("Failed to load account information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
        <div className="space-y-4">
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!currentUser || !currentUser.accounts || currentUser.accounts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-[#141414] p-8 text-center">
        <CreditCard className="mx-auto h-10 w-10 text-neutral-600" />
        <p className="mt-3 text-neutral-400">No accounts linked</p>
      </div>
    );
  }

  const totalBalance = currentUser.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="rounded-xl border border-white/8 bg-[#141414]">
      <div className="border-b border-white/8 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Wallet Balance</h2>
          <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">
            {currentUser.accounts.length} {currentUser.accounts.length === 1 ? "account" : "accounts"}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">${totalBalance.toFixed(2)}</span>
          <span className="flex items-center gap-1 text-sm text-green-400">
            <TrendingUp className="h-4 w-4" />
            Available now
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Linked Accounts
        </p>
        <div className="space-y-3">
          {currentUser.accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-900/50 p-4 transition-colors hover:border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{account.bankName || "Bank Account"}</p>
                  <p className="text-xs text-neutral-500">••••{String(account.accountNumber).slice(-4)}</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-white">${account.balance.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
