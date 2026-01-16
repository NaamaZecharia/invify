import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { OrderService } from "../services/orderService";

const prisma = new PrismaClient();

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: "Failed to load orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: "Failed to load order" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, currency, notes, taxTotal, discountTotal, items } = req.body as {
      customerId: string;
      currency?: string;
      notes?: string;
      taxTotal?: string;
      discountTotal?: string;
      items: Array<
        | { productId: string; quantity: number }
        | { name: string; description?: string; quantity: number; unitPrice: string }
      >;
    };

    if (!customerId) return res.status(400).json({ message: "customerId is required" });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required and must not be empty" });
    }

    for (const item of items) {
      // product item
      if ("productId" in item) {
        if (!item.productId) return res.status(400).json({ message: "productId is required" });
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          return res.status(400).json({ message: "quantity must be an integer > 0" });
        }
        continue;
      }

      // custom item
      if (!item.name || !item.name.trim()) {
        return res.status(400).json({ message: "Custom item must have a name" });
      }
      if (!item.unitPrice) {
        return res.status(400).json({ message: "Custom item must have a unitPrice" });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: "quantity must be an integer > 0" });
      }
    }

    const order = await OrderService.createOrder({
      customerId,
      currency,
      notes,
      taxTotal,
      discountTotal,
      items,
    });

    res.status(201).json(order);
  } catch (e: any) {
    if (e.message === "Customer not found") return res.status(404).json({ message: e.message });
    res.status(400).json({ message: e.message || "Failed to create order" });
  }
};


export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body as {
    status?: OrderStatus;
    notes?: string;
  };

  try {
    // Validate status if provided
    if (status && !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: true,
      },
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(500).json({ message: "Failed to update order" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(500).json({ message: "Failed to delete order" });
  }
};
