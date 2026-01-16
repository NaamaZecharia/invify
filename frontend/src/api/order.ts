import api from "../utils/api";
import type { CustomerDto } from "./customer";

export type OrderStatus = "DRAFT" | "CONFIRMED" | "CANCELED" | "FULFILLED";

export type OrderItemDto = {
  id: string;
  orderId: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderDto = {
  id: string;
  customerId: string;
  customer: CustomerDto;
  status: OrderStatus;
  currency: string;
  subtotal: string;
  taxTotal: string;
  discountTotal: string;
  total: string;
  notes?: string | null;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  customerId: string;
  currency?: string;
  notes?: string;
  taxTotal?: string;
  discountTotal?: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: string;
  }>;
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  notes?: string;
};

export const getOrders = async (): Promise<OrderDto[]> => {
  const res = await api.get("/orders");
  return res.data;
};

export const getOrderById = async (id: string): Promise<OrderDto> => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const createOrder = async (data: CreateOrderInput): Promise<OrderDto> => {
  const res = await api.post("/orders", data);
  return res.data;
};

export const updateOrder = async (id: string, data: UpdateOrderInput): Promise<OrderDto> => {
  const res = await api.put(`/orders/${id}`, data);
  return res.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};
