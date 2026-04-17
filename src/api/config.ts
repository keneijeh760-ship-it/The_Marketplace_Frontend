// src/api/config.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  USERS: `${API_BASE_URL}/users`,
  ACCOUNTS: `${API_BASE_URL}/accounts`,
  PRODUCTS: `${API_BASE_URL}/products`,
  CART: `${API_BASE_URL}/api/cart`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  BANKING: `${API_BASE_URL}/transfers`,
};

export const REQUEST_TIMEOUT = 30000;

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  REQUEST_TIMEOUT,
  getAuthToken,
  getAuthHeaders,
};