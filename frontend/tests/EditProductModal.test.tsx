import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditProductModal from "../src/components/EditProductModal";

vi.mock("../src/api/category", () => ({
  getCategories: vi.fn(),
}));

vi.mock("../src/api/product", () => ({
  updateProduct: vi.fn(),
}));

import { getCategories, type CategoryDto } from "../src/api/category";
import { updateProduct, type ProductDto } from "../src/api/product";

describe("EditProductModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates product and calls onUpdated", async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
    ] as CategoryDto[]);

    vi.mocked(updateProduct).mockResolvedValueOnce({} as ProductDto);

    const onUpdated = vi.fn();
    const onClose = vi.fn();

    const product = {
      id: "p1",
      code: "PROD1",
      name: "Product 1",
      description: null,
      price: 10,
      quantity: 2,
      createdAt: new Date().toISOString(),
      categoryId: "cat1",
      category: { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
    } as ProductDto;

    render(
      <EditProductModal
        isOpen={true}
        product={product}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    );

    // wait for modal fields (categories fetch)
    await screen.findByText(/edit product/i);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "New Name" } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "5" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onUpdated).toHaveBeenCalledTimes(1);
    });

    expect(updateProduct).toHaveBeenCalledWith("p1", expect.objectContaining({
      code: "PROD1",
      name: "New Name",
      price: 12,
      quantity: 5,
      categoryId: "cat1",
    }));
  });
});
