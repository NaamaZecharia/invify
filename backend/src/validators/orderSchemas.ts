import { z } from "zod";

const moneyString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Money must be a string like '10' or '10.50'");

const productItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const customItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  quantity: z.number().int().min(1),
  unitPrice: moneyString,
});

// XOR-ish rule: either productId-based OR custom-based
export const orderItemInputSchema = z.union([productItemSchema, customItemSchema]);

export const updateOrderItemsSchema = z.object({
  taxTotal: moneyString.optional(),
  discountTotal: moneyString.optional(),
  items: z.array(orderItemInputSchema).min(1),
});
