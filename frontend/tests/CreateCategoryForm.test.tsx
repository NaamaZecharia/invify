import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateCategoryForm from '../src/components/CreateCategoryForm';

vi.mock('../src/api/category', () => ({
  createCategory: vi.fn(),
}));

import { createCategory, getCategoryTypes, type CategoryDto } from "../src/api/category";

describe('CreateCategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form fields', async () => {
     vi.mocked(getCategoryTypes).mockResolvedValue([
      { id: "t1", code: "SERVICE", label: "Service" },
    ]);

    render(<CreateCategoryForm onCreated={() => {}} />);

    expect(screen.getByLabelText(/code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(await screen.findByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  it('calls createCategory with form data and then calls onCreated', async () => {
    const onCreated = vi.fn();

    vi.mocked(getCategoryTypes).mockResolvedValue([
      { id: "t1", code: "SERVICE", label: "Service" },
      { id: "t2", code: "PRODUCT", label: "Product" },
    ]);

    vi.mocked(createCategory).mockResolvedValue({
      id: "c1",
      code: "TEST",
      name: "Test Category",
      typeId: "t2",
      type: { id: "t2", code: "PRODUCT", label: "Product" },
    } as CategoryDto);

    render(<CreateCategoryForm onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText(/code/i), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Category' } });
    
    const typeSelect = await screen.findByRole("combobox");
    fireEvent.change(typeSelect, { target: { value: "t2" } });

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledTimes(1);
      expect(onCreated).toHaveBeenCalledTimes(1);
    });

    expect(createCategory).toHaveBeenCalledWith({
      code: 'TEST',
      name: 'Test Category',
       typeId: "t2",
    });

    expect(screen.getByLabelText(/code/i)).toHaveValue('');
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByRole("combobox")).toHaveValue('');
  });

  it('shows alert on failure and does not call onCreated', async () => {
    const onCreated = vi.fn();

     vi.mocked(getCategoryTypes).mockResolvedValue([
      { id: "t1", code: "SERVICE", label: "Service" },
    ]);

    vi.mocked(createCategory).mockRejectedValue(new Error('boom'));

    render(<CreateCategoryForm onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText(/code/i), { target: { value: 'TEST' } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Category' } });

    await screen.findByRole("combobox");

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create category/i)).toBeInTheDocument();
    });

    expect(onCreated).not.toHaveBeenCalled();
  });
});