import { API_ENDPOINTS } from './config';
import { api } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  accountNumber: number;
  bankName: string;
  initialBalance: number;
}

export interface AuthResponse {
  token: string;
}

const API_URL = API_ENDPOINTS.AUTH;

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post(`${API_URL}/register`, userData);
  return response.data;
};