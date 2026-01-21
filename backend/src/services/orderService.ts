import { PrismaClient, Prisma, OrderStatus, InvoiceStatus } from "@prisma/client";

const prisma = new PrismaClient();

function toDecimal(value: string): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

function calcLineTotal(quantity: number, unitPrice: Prisma.Decimal): Prisma.Decimal {
  return unitPrice.mul(quantity);
}

function fromFloatToDecimal(value: number): Prisma.Decimal {
    return new Prisma.Decimal(value.toFixed(2));
  }

function sumDecimals(values: Prisma.Decimal[]): Prisma.Decimal {
  return values.reduce((acc, v) => acc.add(v), new Prisma.Decimal(0));
}

export class OrderService {
  static async createOrder(input: {
    customerId: string;
    currency?: string;
    notes?: string;
    taxTotal?: string;       // money string
    discountTotal?: string;  // money string
    items: Array<
      | { productId: string; quantity: number }
      | { name: string; description?: string; quantity: number; unitPrice: string }
    >;
  }) {
    const taxTotal = toDecimal(input.taxTotal ?? "0");
    const discountTotal = toDecimal(input.discountTotal ?? "0");
    if (taxTotal.isNegative()) throw new Error("taxTotal must be >= 0");
    if (discountTotal.isNegative()) throw new Error("discountTotal must be >= 0");

    return prisma.$transaction(async (tx) => {
      // Ensure customer exists (nice API error)
      const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
      if (!customer) throw new Error("Customer not found");

      const productItems = input.items.filter(
        (x): x is { productId: string; quantity: number } => (x as any).productId
      );
      const customItems = input.items.filter(
        (x): x is { name: string; description?: string; quantity: number; unitPrice: string } =>
          !(x as any).productId
      );

      const productIds = [...new Set(productItems.map((x) => x.productId))];

      const products = productIds.length
        ? await tx.product.findMany({
            where: { id: { in: productIds } },
            include: { category: { include: { type: true } } },
          })
        : [];

        const productMap = new Map(products.map((p) => [p.id, p]));
        for (const it of productItems) {
          if (!productMap.has(it.productId)) {
            throw new Error(`Invalid productId: ${it.productId}`);
          }
        }

      // Create the order first (so we have orderId)
      const order = await tx.order.create({
        data: {
          customerId: input.customerId,
          currency: input.currency ?? "USD",
          notes: input.notes?.trim() || null,
          taxTotal,
          discountTotal,
          subtotal: new Prisma.Decimal(0),
          total: new Prisma.Decimal(0),
        },
      });
      
      const rows: Prisma.OrderItemCreateManyInput[] = [];

      // Product-based rows
      for (const it of productItems) {
        const p = productMap.get(it.productId)!;
        const unitPrice = p.price;
        const lineTotal = unitPrice.mul(it.quantity);

        rows.push({
          orderId: order.id,
          productId: p.id,
          quantity: it.quantity,
          name: p.name,
          description: p.description ?? null,
          unitPrice,
          lineTotal,
          categoryName: p.category?.name ?? null,
          categoryCode: p.category?.code ?? null,
          typeLabel: p.category?.type?.label ?? null,
        });
  }

  // custom items
  for (const it of customItems) {
    const unitPrice = toDecimal(it.unitPrice);
    if (unitPrice.isNegative()) throw new Error("unitPrice must be >= 0");
    const lineTotal = unitPrice.mul(it.quantity);

    rows.push({
      orderId: order.id,
      productId: null,
      quantity: it.quantity,
      name: it.name.trim(),
      description: it.description?.trim() || null,
      unitPrice,
      lineTotal,
      categoryName: null,
      categoryCode: null,
      typeLabel: "Custom",
    });
  }

  if (rows.length === 0) throw new Error("Order must have at least one item");

  await tx.orderItem.createMany({ data: rows });
  const subtotal = sumDecimals(rows.map((r) => r.lineTotal as Prisma.Decimal));
  const total = subtotal.add(taxTotal).sub(discountTotal);
  if (total.isNegative()) throw new Error("Total cannot be negative (discount too large)");

  const updated = await tx.order.update({
    where: { id: order.id },
    data: { subtotal, total },
    include: { customer: true, items: true },
  });

  return updated;
});

}
  

  static async updateOrderItems(
      orderId: string,
      input: {
      taxTotal?: string;
      discountTotal?: string;
      items: Array<
          | { productId: string; quantity: number }
          | { name: string; description?: string; quantity: number; unitPrice: string }
      >;
      }
  ) {
      return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");
      if (order.status !== OrderStatus.DRAFT) throw new Error("Only DRAFT orders can be edited");
      
      const taxTotal = input.taxTotal !== undefined ? toDecimal(input.taxTotal) : order.taxTotal;
      const discountTotal =
          input.discountTotal !== undefined ? toDecimal(input.discountTotal) : order.discountTotal;
      
      if (taxTotal.isNegative()) throw new Error("taxTotal must be >= 0");
      if (discountTotal.isNegative()) throw new Error("discountTotal must be >= 0");
      
      const productItems = input.items.filter(
          (x): x is { productId: string; quantity: number } => (x as any).productId
      );
  
      const customItems = input.items.filter(
          (x): x is { name: string; description?: string; quantity: number; unitPrice: string } =>
          !(x as any).productId
      );
  
      // 2) Fetch products in one query
      const productIds = [...new Set(productItems.map((x) => x.productId))];
      const products = productIds.length
          ? await tx.product.findMany({
              where: { id: { in: productIds } },
              include: { category: { include: { type: true } } },
          })
          : [];
      
      const productMap = new Map(products.map((p) => [p.id, p]));
      
      // Validate all productIds exist
      for (const it of productItems) {
          if (!productMap.has(it.productId)) {
          throw new Error(`Invalid productId: ${it.productId}`);
          }
      }
  
      // 3) Build OrderItem rows with snapshots
      const rows: Array<Prisma.OrderItemCreateManyInput> = [];
  
      // Product-based rows
      for (const it of productItems) {
          const p = productMap.get(it.productId)!;
      
          const unitPrice = p.price;
          if (unitPrice.isNegative()) throw new Error("unitPrice must be >= 0");
          const lineTotal = unitPrice.mul(it.quantity);
      
          rows.push({
          orderId,
          productId: p.id,
          quantity: it.quantity,
          name: p.name,
          description: p.description ?? null,
          unitPrice,
          lineTotal,
          categoryName: p.category?.name ?? null,
          categoryCode: p.category?.code ?? null,
          typeLabel: p.category?.type?.label ?? null,
          });
      }
  
      // Custom rows
      for (const it of customItems) {
          const unitPrice = toDecimal(it.unitPrice);
          if (unitPrice.isNegative()) throw new Error("unitPrice must be >= 0");
      
          const lineTotal = unitPrice.mul(it.quantity);
          rows.push({
          orderId,
          productId: null,
          quantity: it.quantity,
          name: it.name,
          description: it.description ?? null,
          unitPrice,
          lineTotal,
          categoryName: null,
          categoryCode: null,
          typeLabel: "Custom",
          });
      }
  
      if (rows.length === 0) throw new Error("Order must have at least one item");
  
      // 4) Recalculate totals
      const subtotal = sumDecimals(rows.map((r) => r.lineTotal as Prisma.Decimal));
      const total = subtotal.add(taxTotal).sub(discountTotal);
      if (total.isNegative()) throw new Error("Total cannot be negative (discount too large)");
  
      // 5) Replace items + update order totals in one transaction
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.orderItem.createMany({ data: rows });
  
      const updated = await tx.order.update({
          where: { id: orderId },
          data: { taxTotal, discountTotal, subtotal, total },
          include: {
          customer: true,
          items: true,
          },
      });
  
      return updated;
      });
  }

  static async confirmOrder(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, customer: true, invoice: true, },
      });
  
      if (!order) throw new Error("Order not found");
      if (order.status !== OrderStatus.DRAFT) {
        if (order.status === OrderStatus.CONFIRMED && order.invoice) {
          return { order, invoiceId: order.invoice.id };
        }
        throw new Error("Only DRAFT orders can be confirmed");
      }
      if (order.items.length === 0) throw new Error("Order has no items");
  
      // safety: recalc subtotal
      const subtotal = order.items.reduce(
        (acc, i) => acc.add(i.lineTotal),
        new Prisma.Decimal(0)
      );
  
      const total = subtotal.add(order.taxTotal).sub(order.discountTotal);
  
      if (total.isNegative()) throw new Error("Order total cannot be negative");

      const confirmedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          subtotal,
          total,
        },
        include: { items: true, customer: true },
      });

       const existingInvoice = await tx.invoice.findUnique({
        where: { orderId: confirmedOrder.id },
        select: { id: true },
      });

      if (existingInvoice) {
        return { order: confirmedOrder, invoiceId: existingInvoice.id };
      }

        const invoice = await tx.invoice.create({
        data: {
          orderId: confirmedOrder.id,
          customerId: confirmedOrder.customerId,
          currency: confirmedOrder.currency,
          subtotal: confirmedOrder.subtotal,
          taxTotal: confirmedOrder.taxTotal,
          discountTotal: confirmedOrder.discountTotal,
          total: confirmedOrder.total,

          items: {
            create: confirmedOrder.items.map((it) => ({
              name: it.name,
              description: it.description,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              lineTotal: it.lineTotal,
              categoryName: it.categoryName,
              categoryCode: it.categoryCode,
              typeLabel: it.typeLabel,
            })),
          },
        },
        select: { id: true },
      });
      
      return { order: confirmedOrder, invoiceId: invoice.id };
    });
  }
  
}