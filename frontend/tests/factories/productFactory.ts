import type { ProductDto } from "../../src/api/product";

export const productFactory = (
  overrides?: Partial<ProductDto>
): ProductDto => ({
  id: "p1",
  code: "PROD1",
  name: "Product",
  description: "desc",
    price: 10,
    quantity: 5,
    createdAt: new Date().toISOString(),
    categoryId: "cat-1",
    category: {
      id: "cat-1",
      code: "CAT", 
      name: "Category",
      typeId: null,
      type: null,
    },
  ...overrides,
});
