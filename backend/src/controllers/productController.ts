import { Request, Response } from "express";
import { prisma } from "../prisma";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: { include: { type: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to load products" });
  }
};


export const createProduct = async (req: Request, res: Response) => {
  const { code, name, description, price, quantity, categoryId } = req.body as {
    code: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    categoryId: string;
  };

  const normalizedCode = (code ?? "").trim().toUpperCase();
  const normalizedName = (name ?? "").trim();
  const normalizedDesc = (description ?? "").trim() || null;

  const parsedPrice = Number(price);
  const parsedQty = Number(quantity);

  if (!normalizedCode || !normalizedName || !categoryId) {
    return res.status(400).json({ message: "code, name, and categoryId are required" });
  }
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "price must be a valid number >= 0" });
  }
  if (!Number.isInteger(parsedQty) || parsedQty < 0) {
    return res.status(400).json({ message: "quantity must be an integer >= 0" });
  }

  const codeExists = await prisma.product.findUnique({ where: { code: normalizedCode } });
  if (codeExists) {
    return res.status(409).json({ message: "Product code already exists" });
  }

  const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!categoryExists) {
    return res.status(400).json({ message: "Invalid categoryId" });
  }

  const created = await prisma.product.create({
    data: {
      code: normalizedCode,
      name: normalizedName,
      description: normalizedDesc,
      price: parsedPrice,
      quantity: parsedQty,
      categoryId,
    },
    include: { category: { include: { type: true } } },
  });

  res.status(201).json(created);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, name, description, price, quantity, categoryId } = req.body as {
    code: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    categoryId: string;
  };

  const normalizedCode = (code ?? "").trim().toUpperCase();
  const normalizedName = (name ?? "").trim();
  const normalizedDesc = (description ?? "").trim() || null;

  const parsedPrice = Number(price);
  const parsedQty = Number(quantity);

  if (!normalizedCode || !normalizedName || !categoryId) {
    return res.status(400).json({ message: "code, name, and categoryId are required" });
  }
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "price must be a valid number >= 0" });
  }
  if (!Number.isInteger(parsedQty) || parsedQty < 0) {
    return res.status(400).json({ message: "quantity must be an integer >= 0" });
  }

  const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!categoryExists) {
    return res.status(400).json({ message: "Invalid categoryId" });
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        code: normalizedCode,
        name: normalizedName,
        description: normalizedDesc,
        price: parsedPrice,
        quantity: parsedQty,
        categoryId,
      },
      include: { category: { include: { type: true } } },
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ message: "Product code already exists" });
    }
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Failed to delete product" });
  }
};
