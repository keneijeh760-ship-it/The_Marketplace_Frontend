const isDevelopment = import.meta.env.MODE === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'  
  : import.meta.env.VITE_BACKEND_URL as string;

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  USERS: `${API_BASE_URL}/users`,
  ACCOUNTS: `${API_BASE_URL}/accounts`,
  PRODUCTS: `${API_BASE_URL}/products`,
  CART: `${API_BASE_URL}/cart`,
  ORDERS: `${API_BASE_URL}/orders`,
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  BANKING: `${API_BASE_URL}/banking`,
};

export const REQUEST_TIMEOUT = 30000; // 30 seconds

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