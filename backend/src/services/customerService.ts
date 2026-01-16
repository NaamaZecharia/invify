import { prisma } from "../prisma";

export function normalizeCustomerCreate(input: any) {
  return {
    firstName: (input.firstName ?? "").trim(),
    lastName: (input.lastName ?? "").trim(),
    phone: (input.phone ?? "").trim() || null,
    email: (input.email ?? "").trim() || null,
    address: (input.address ?? "").trim() || null,
    companyName: (input.companyName ?? "").trim() || null,
  };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getCustomers() {
  return prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
}
