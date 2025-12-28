import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const types = [
    { code: "PRODUCT", label: "Product" },
    { code: "SERVICE", label: "Service" },
    { code: "EXPENSE", label: "Expense" },
    { code: "OTHER", label: "Other" },
  ];

  for (const t of types) {
    await prisma.categoryType.upsert({
      where: { code: t.code },
      update: { label: t.label },
      create: t,
    });
  }
}

main()
  .finally(async () => prisma.$disconnect());
