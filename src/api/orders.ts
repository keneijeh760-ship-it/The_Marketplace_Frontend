import { api } from "./client";

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderItems: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
}

export interface CheckoutRequest {
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
}

export const checkout = async (data: CheckoutRequest): Promise<Order> => {
  const res = await api.post("/api/orders/checkout", data);
  return res.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const res = await api.get("/api/orders");
  return res.data;
};

export const getOrderById = async (orderId: number): Promise<Order> => {
  const res = await api.get(`/api/orders/${orderId}`);
  return res.data;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const res = await api.get("/api/orders/all");
  return res.data;
};

export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<Order> => {
  const res = await api.patch(`/api/orders/${orderId}/status`, { status });
  return res.data;
};