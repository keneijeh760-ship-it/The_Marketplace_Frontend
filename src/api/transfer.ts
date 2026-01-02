import { api } from "./client";

export interface TransferRequest {
  fromAccountNumber: number;  // ✅ CHANGED from fromAccountId
  toAccountNumber: number;    // ✅ CHANGED from toAccountId
  amount: number;
}

export const transferMoney = async (data: TransferRequest) => {
  const res = await api.post("/api/transactions/transfer", data);
  return res.data;
};