import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: { type: true },
    orderBy: { name: "asc" },
  });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const { code, name, typeId } = req.body as { code: string; name: string; typeId?: string };

  const normalizedCode = (code ?? "").trim().toUpperCase();
  const normalizedName = (name ?? "").trim();

  if (!normalizedCode || !normalizedName) {
    return res.status(400).json({ message: "Code and Name fields are required" });
  }

  const exists = await prisma.category.findUnique({ where: { code: normalizedCode } });
  if (exists) {
    return res.status(409).json({ message: "Category code already exists" });
  }

  if (typeId) {
    const typeExists = await prisma.categoryType.findUnique({ where: { id: typeId } });
    if (!typeExists) return res.status(400).json({ message: "Invalid typeId" });
  }

  const category = await prisma.category.create({
    data: { code: normalizedCode, name: normalizedName, typeId: typeId ?? null },
    include: { type: true },
  });

  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, name, typeId } = req.body as { code: string; name: string; typeId?: string };

  const normalizedCode = (code ?? "").trim().toUpperCase();
  const normalizedName = (name ?? "").trim();

  if (!normalizedCode || !normalizedName) {
    return res.status(400).json({ message: "Code and Name fields are required" });
  }

  if (typeId) {
    const typeExists = await prisma.categoryType.findUnique({ where: { id: typeId } });
    if (!typeExists) return res.status(400).json({ message: "Invalid typeId" });
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { code: normalizedCode, name: normalizedName, typeId: typeId ?? null },
      include: { type: true },
    });
    res.json(updated);
  } catch (e: any) {
    // Prisma unique constraint (code)
    if (e?.code === "P2002") {
      return res.status(409).json({ message: "Category code already exists" });
    }
    return res.status(500).json({ message: "Failed to update category" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const productsCount = await prisma.product.count({ where: { categoryId: id } });
  if (productsCount > 0) {
    return res.status(409).json({
      message: "Cannot delete category with existing products/items",
      productsCount,
    });
  }

  try {
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Failed to delete category" });
  }
};
