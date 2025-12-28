import api from "../utils/api";

export type CategoryTypeDto = {
  id: string;
  code: string;
  label: string;
};

export type CategoryDto = {
  id: string;
  code: string;
  name: string;
  typeId?: string | null;
  type?: CategoryTypeDto | null;
};

export type CreateCategoryInput = {
  code: string;
  name: string;
  typeId?: string;
};

export type CreateCategoryTypeInput = {
  code: string;
  label: string;
};

export const getCategories = async (): Promise<CategoryDto[]> => {
  const res = await api.get("/categories");
  return res.data;
};

export const createCategory = async (data: CreateCategoryInput): Promise<CategoryDto> => {
  const res = await api.post("/categories", data);
  return res.data;
};

export const getCategoryTypes = async (): Promise<CategoryTypeDto[]> => {
  const res = await api.get("/category-types");
  return res.data;
};

export const createCategoryType = async (data: CreateCategoryTypeInput): Promise<CategoryTypeDto> => {
  const res = await api.post("/category-types", data);
  return res.data;
};

export const updateCategory = async (id: string, data: { code: string; name: string; typeId?: string }) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`);
};
