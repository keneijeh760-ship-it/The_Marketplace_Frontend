import { useState } from "react";
import { transferMoney } from "../api/transfer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

const TransferForm = ({ onSuccess }: Props) => {
  const [fromAccountNumber, setFromAccountNumber] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
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
        fromAccountNumber: Number(fromAccountNumber),
        toAccountNumber: Number(toAccountNumber),
        amount: Number(amount),
      });
      setSuccess("Transfer completed successfully!");
      setFromAccountNumber("");
      setToAccountNumber("");
      setAmount("");
      onSuccess();
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } | string };
        message?: string;
      };
      const message =
        (typeof e.response?.data === "object" && e.response?.data && "message" in e.response.data
          ? e.response.data.message
          : null) ||
        (typeof e.response?.data === "string" ? e.response.data : null) ||
        e.message;
      setError(message || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Send className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Transfer Rail</h2>
      </div>
      <p className="mb-4 text-sm text-neutral-500">Move funds between wallet-linked bank accounts.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccountNumber">From Account</Label>
          <Input
            id="fromAccountNumber"
            type="number"
            placeholder="Your account number"
            value={fromAccountNumber}
            onChange={(e) => setFromAccountNumber(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAccountNumber">To Account</Label>
          <Input
            id="toAccountNumber"
            type="number"
            placeholder="Recipient account number"
            value={toAccountNumber}
            onChange={(e) => setToAccountNumber(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="pl-7"
            />
          </div>
          <div className="flex gap-2">
            {[50, 100, 250].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-400 transition-colors hover:border-white/20 hover:text-neutral-200"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        <Button type="submit" variant="buy" className="w-full" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Sending..." : "Send Money"}
        </Button>
      </form>
    </div>
  );
};

export default TransferForm;
