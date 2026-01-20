import api from "../utils/api";

export type CustomerDto = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  companyName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerInput = {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  companyName?: string;
};

export type UpdateCustomerInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  companyName?: string;
};

export const getCustomers = async (): Promise<CustomerDto[]> => {
  const res = await api.get("/customers");
  return res.data;
};

export const createCustomer = async (data: CreateCustomerInput): Promise<CustomerDto> => {
  const res = await api.post("/customers", data);
  return res.data;
};

export const updateCustomer = async (id: string, data: UpdateCustomerInput): Promise<CustomerDto> => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};
