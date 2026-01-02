import { api } from "./client";

export interface Transaction {
  id: number;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  status: string;
  timestamp: string;
}

export const getMyTransactions = async (): Promise<Transaction[]> => {
  const res = await api.get("/api/transactions/me");  // ← Add /api prefix
  return res.data;
};