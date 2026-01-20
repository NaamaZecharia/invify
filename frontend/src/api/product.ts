import api from "../utils/api";
import type { CategoryDto } from "./category";

export type ProductDto = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  createdAt: string;
  categoryId: string;
  category: CategoryDto;
};

export type CreateProductInput = {
  code: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  categoryId: string;
};

export const getProducts = async (): Promise<ProductDto[]> => {
  const res = await api.get("/products");
  return res.data;
};

export const createProduct = async (data: CreateProductInput): Promise<ProductDto> => {
  const res = await api.post("/products", data);
  return res.data;
};

export const updateProduct = async (id: string, data: CreateProductInput): Promise<ProductDto> => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};