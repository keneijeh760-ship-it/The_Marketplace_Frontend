import { api } from "./client";

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  subtotal: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export const getCart = async (): Promise<CartItem[]> => {
  const res = await api.get("/api/cart");
  return res.data;
};

export const addToCart = async (data: AddToCartRequest): Promise<CartItem> => {
  const res = await api.post("/api/cart", data);
  return res.data;
};

export const updateCartItemQuantity = async (
  cartItemId: number,
  data: UpdateQuantityRequest
): Promise<CartItem> => {
  const res = await api.put(`/api/cart/${cartItemId}`, data);
  return res.data;
};

export const removeFromCart = async (cartItemId: number): Promise<void> => {
  await api.delete(`/api/cart/${cartItemId}`);
};

export const clearCart = async (): Promise<void> => {
  await api.delete("/api/cart");
};

export const getCartTotal = async (): Promise<number> => {
  const res = await api.get("/api/cart/total");
  return res.data.total;
};