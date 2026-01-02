import { api } from "./client";

export interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  bankName?: string;  // ✅ NEW
}

export interface User {
  id: number;
  email: string;
  name: string;
  accounts: Account[];
}

export const getCurrentUser = async (): Promise<User> => {
  const res = await api.get("/users/me");
  return res.data;
};