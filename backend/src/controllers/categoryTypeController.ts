import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategoryTypes = async (_req: Request, res: Response) => {
  const types = await prisma.categoryType.findMany({
    orderBy: { label: "asc" },
    select: { id: true, code: true, label: true },
  });

  res.json(types);
};

export const createCategoryType = async (req: Request, res: Response) => {
    const { code, label } = req.body as { code: string; label: string };

    const normalizedCode = (code ?? "").trim().toUpperCase();
    const normalizedLabel = (label ?? "").trim();

    if (!normalizedCode || !normalizedLabel) {
    return res.status(400).json({ message: "Code and Label are required" });
    }

    const exists = await prisma.categoryType.findUnique({ where: { code: normalizedCode } });
    if (exists) {
        return res.status(409).json({ message: "Category type code already exists" });
    }

    const created = await prisma.categoryType.create({
        data: { code: normalizedCode, label: normalizedLabel },
        select: { id: true, code: true, label: true },
    });

    res.status(201).json(created);
};