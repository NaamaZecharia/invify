import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Products from "../src/pages/Products";
import { productFactory } from "./factories/productFactory";

// Mock category API
vi.mock("../src/api/category", () => ({
  getCategories: vi.fn(),
}));

// Mock product API
vi.mock("../src/api/product", () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

import { getCategories, type CategoryDto } from "../src/api/category";
import { getProducts, createProduct, deleteProduct, type ProductDto } from "../src/api/product";

vi.mock("../src/components/EditProductModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Mock EditProductModal Open</div> : null,
}));

describe("Products page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads categories + products and renders list", async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
    ] as CategoryDto[]);

    vi.mocked(getProducts).mockResolvedValueOnce([
    productFactory({ name: "Product 1", quantity: 2 }),
    ]);

    render(<Products />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    expect(await screen.findByText(/product 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\(PROD1\)/)).toBeInTheDocument();
    expect(screen.getByText(/qty:\s*2/i)).toBeInTheDocument();

    expect(getCategories).toHaveBeenCalledTimes(1);
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  it("creates a product and prepends it to the list", async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
    ] as CategoryDto[]);

    vi.mocked(getProducts).mockResolvedValueOnce([] as ProductDto[]);

    vi.mocked(createProduct).mockResolvedValueOnce({
      id: "p2",
      code: "PROD2",
      name: "Product 2",
      description: "desc",
      price: 12.5,
      quantity: 3,
      createdAt: new Date().toISOString(),
      categoryId: "cat1",
      category: { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
    } as ProductDto);

    render(<Products />);

    // wait for initial load
    await screen.findByText(/no products yet/i);

    fireEvent.change(screen.getByLabelText(/code/i), { target: { value: "prod2" } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Product 2" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "desc" } });
    fireEvent.change(screen.getByLabelText(/^price/i), { target: { value: "12.5" } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "3" } });

    // category select exists; default is set to first category by load()
    fireEvent.click(screen.getByRole("button", { name: /add product/i }));

    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledTimes(1);
    });

    // code normalized to uppercase
    expect(createProduct).toHaveBeenCalledWith({
      code: "PROD2",
      name: "Product 2",
      description: "desc",
      price: 12.5,
      quantity: 3,
      categoryId: "cat1",
    });

    expect(await screen.findByText(/product 2/i)).toBeInTheDocument();
  });

  it("deletes a product after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
    ] as CategoryDto[]);

    vi.mocked(getProducts).mockResolvedValueOnce([
      {
        id: "p1",
        code: "PROD1",
        name: "Product 1",
        description: null,
        price: 10,
        quantity: 2,
        createdAt: new Date().toISOString(),
        categoryId: "cat1",
        category: { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
      },
    ] as ProductDto[]);

    vi.mocked(deleteProduct).mockResolvedValueOnce(undefined);

    render(<Products />);

    expect(await screen.findByText(/product 1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(deleteProduct).toHaveBeenCalledTimes(1);
      expect(deleteProduct).toHaveBeenCalledWith("p1");
    });

    await waitFor(() => {
      expect(screen.queryByText(/product 1/i)).not.toBeInTheDocument();
    });
  });

  it("opens edit modal when clicking Edit", async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
    ] as CategoryDto[]);

    vi.mocked(getProducts).mockResolvedValueOnce([
      {
        id: "p1",
        code: "PROD1",
        name: "Product 1",
        description: null,
        price: 10,
        quantity: 2,
        createdAt: new Date().toISOString(),
        categoryId: "cat1",
        category: { id: "cat1", code: "CAT", name: "Category 1", typeId: null, type: null },
      },
    ] as ProductDto[]);

    render(<Products />);

    await screen.findByText(/product 1/i);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(await screen.findByText(/mock editproductmodal open/i)).toBeInTheDocument();
  });
});
