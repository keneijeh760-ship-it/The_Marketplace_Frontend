import { api } from "./client";

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingEscrow: number;
  totalUsers: number;
  ordersByStatus: Record<string, number>;
  totalRefunded: number;
}

export interface UserBalance {
  userId: number;
  name: string;
  email: string;
  role: string;
  totalBalance: number;
  accountCount: number;
}

export interface UserDetails {
  userId: number;
  name: string;
  email: string;
  role: string;
  accounts: any[];
  totalOrders: number;
  totalSpent: number;
}

// Dashboard stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/api/admin/dashboard");
  return res.data;
};

// User management
export const getAllUsers = async (): Promise<UserBalance[]> => {
  const res = await api.get("/api/admin/users");
  return res.data;
};

export const getUserDetails = async (userId: number): Promise<UserDetails> => {
  const res = await api.get(`/api/admin/users/${userId}`);
  return res.data;
};

// Order management
export const getPendingEscrowOrders = async (): Promise<any[]> => {
  const res = await api.get("/api/admin/orders/pending-escrow");
  return res.data;
};

export const getOrdersByStatus = async (status: string): Promise<any[]> => {
  const res = await api.get(`/api/admin/orders/status/${status}`);
  return res.data;
};

// Transaction management
export const getAllTransactions = async (): Promise<any[]> => {
  const res = await api.get("/api/admin/transactions");
  return res.data;
};

export const getTransactionsByType = async (type: string): Promise<any[]> => {
  const res = await api.get(`/api/admin/transactions/type/${type}`);
  return res.data;
};