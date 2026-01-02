// src/api/products.ts
import { API_ENDPOINTS, getAuthHeaders, getAuthToken } from './config';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

const API_URL = API_ENDPOINTS.PRODUCTS;

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};

export const createProduct = async (product: CreateProductRequest): Promise<Product> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Failed to create product');
  }

  return response.json();
};

export const updateProduct = async (id: number, product: Partial<CreateProductRequest>): Promise<Product> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Failed to update product');
  }

  return response.json();
};

export const deleteProduct = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/upload-image`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to upload image');
  }

  return response.text(); // Returns the S3 URL as plain text
};