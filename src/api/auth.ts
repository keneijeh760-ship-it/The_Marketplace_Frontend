// src/api/auth.ts
import { API_ENDPOINTS, getAuthHeaders } from './config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  accountNumber: Number;
  bankName: string;
  initialBalance: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  name: string;
}

const API_URL = API_ENDPOINTS.AUTH;

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Login failed');
  }

  return response.json();
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Registration failed');
  }

  return response.json();
};