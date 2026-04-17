import { api } from "./client";

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

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: string } | string };
    message?: string;
  };

  if (typeof err.response?.data === "object" && err.response?.data && "message" in err.response.data) {
    return err.response.data.message || fallback;
  }
  if (typeof err.response?.data === "string" && err.response.data.trim()) {
    return err.response.data;
  }
  return err.message || fallback;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch products"));
  }
};

export const createProduct = async (product: CreateProductRequest): Promise<Product> => {
  try {
    const response = await api.post("/products", product);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create product"));
  }
};

export const updateProduct = async (id: number, product: Partial<CreateProductRequest>): Promise<Product> => {
  try {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update product"));
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete product"));
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await api.post("/products/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "text",
    });
    return response.data as string;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to upload image"));
  }
};