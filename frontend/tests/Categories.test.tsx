import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Categories from "../src/pages/Categories";

vi.mock("../src/api/category", () => ({
  getCategories: vi.fn(),
}));

import { getCategories } from "../src/api/category";

vi.mock("../src/components/CreateCategoryForm", () => ({
  default: ({ onCreated }: { onCreated: () => void }) => (
    <div>
      <button onClick={onCreated}>Mock CreateCategoryForm: create</button>
    </div>
  ),
}));

describe("Categories page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads categories on mount and renders them (including type label)", async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      {
        id: "c1",
        code: "DEV",
        name: "Development",
        typeId: "t1",
        type: { id: "t1", code: "SERVICE", label: "Service" },
      },
    ]);

    render(<Categories />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    expect(await screen.findByText(/development/i)).toBeInTheDocument();
    expect(screen.getByText(/\(DEV\)/)).toBeInTheDocument();
    expect(screen.getByText(/type:\s*service/i)).toBeInTheDocument();

    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when there are no categories", async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([]);

    render(<Categories />);

    expect(await screen.findByText(/no categories yet/i)).toBeInTheDocument();
    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  it("refreshes categories after CreateCategoryForm calls onCreated", async () => {
    vi.mocked(getCategories)
      .mockResolvedValueOnce([
        {
          id: "c1",
          code: "DEV",
          name: "Development",
          typeId: null,
          type: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "c1",
          code: "DEV",
          name: "Development",
          typeId: null,
          type: null,
        },
        {
          id: "c2",
          code: "OPS",
          name: "Operations",
          typeId: "t2",
          type: { id: "t2", code: "EXPENSE", label: "Expense" },
        },
      ]);

    render(<Categories />);

    expect(await screen.findByText(/development/i)).toBeInTheDocument();
    expect(getCategories).toHaveBeenCalledTimes(1);

    // simulate "create" from mocked CreateCategoryForm -> triggers load() again
    fireEvent.click(screen.getByRole("button", { name: /mock createcategoryform: create/i }));

    await waitFor(() => {
      expect(getCategories).toHaveBeenCalledTimes(2);
    });

    // new item appears after refresh
    expect(await screen.findByText(/operations/i)).toBeInTheDocument();
    expect(screen.getByText(/type:\s*expense/i)).toBeInTheDocument();
  });
});
