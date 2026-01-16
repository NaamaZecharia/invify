import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(customers);
};

export const createCustomer = async (req: Request, res: Response) => {
  const { firstName, LastName, phone, email, address, companyName } = req.body as {
    firstName: string;
    LastName: string;
    phone?: string;
    email?: string;
    address?: string;
    companyName?: string;
  };

  const normalizedFirstName = (firstName ?? "").trim();
  const normalizedLastName = (LastName ?? "").trim();
  const normalizedPhone = (phone ?? "").trim() || null;
  const normalizedEmail = (email ?? "").trim() || null;
  // check if email is valid
  if (normalizedEmail && !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  const normalizedAddress = (address ?? "").trim() || null;
  const normalizedCompanyName = (companyName ?? "").trim() || null;

  if (!normalizedFirstName || !normalizedLastName) {
    return res.status(400).json({ message: "firstName and LastName are required" });
  }

  const created = await prisma.customer.create({
    data: {
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      phone: normalizedPhone,
      email: normalizedEmail,
      address: normalizedAddress,
      companyName: normalizedCompanyName,
    },
  });

  res.status(201).json(created);
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, LastName, phone, email, address, companyName } = req.body as {
    firstName?: string;
    LastName?: string;
    phone?: string;
    email?: string;
    address?: string;
    companyName?: string;
  };

  const normalizedFirstName = firstName ? firstName.trim() : undefined;
  const normalizedLastName = LastName ? LastName.trim() : undefined;
  const normalizedPhone = phone !== undefined ? (phone.trim() || null) : undefined;
  const normalizedEmail = email !== undefined ? (email.trim() || null) : undefined;
  const normalizedAddress = address !== undefined ? (address.trim() || null) : undefined;
  const normalizedCompanyName = companyName !== undefined ? (companyName.trim() || null) : undefined;

  const updateData: any = {};
  if (normalizedFirstName !== undefined) updateData.firstName = normalizedFirstName;
  if (normalizedLastName !== undefined) updateData.LastName = normalizedLastName;
  if (normalizedPhone !== undefined) updateData.phone = normalizedPhone;
  if (normalizedEmail !== undefined) updateData.email = normalizedEmail;
  if (normalizedAddress !== undefined) updateData.address = normalizedAddress;
  if (normalizedCompanyName !== undefined) updateData.companyName = normalizedCompanyName;

  if (normalizedFirstName !== undefined && !normalizedFirstName) {
    return res.status(400).json({ message: "firstName cannot be empty" });
  }
  if (normalizedLastName !== undefined && !normalizedLastName) {
    return res.status(400).json({ message: "LastName cannot be empty" });
  }

  try {
    const updated = await prisma.customer.update({
      where: { id },
      data: updateData,
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(500).json({ message: "Failed to update customer" });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(500).json({ message: "Failed to delete customer" });
  }

};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};