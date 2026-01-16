import type { CategoryDto } from "../../src/api/category";

export const categoryFactory = (
  overrides?: Partial<CategoryDto>
): CategoryDto => ({
  id: "cat-1",
  code: "CAT",
  name: "Category",
  typeId: null,
  type: null,
  ...overrides,
});
