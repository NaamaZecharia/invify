import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getCategories, type CategoryDto } from "../api/category";
import EditProductModal from "../components/EditProductModal";
import { createProduct, deleteProduct, getProducts, type ProductDto } from "../api/product";

type FormState = {
  code: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  categoryId: string;
};

function normalizeCode(v: string) {
  return v.trim().toUpperCase();
}

export default function Products() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    code: "",
    name: "",
    description: "",
    price: "0",
    quantity: "0",
    categoryId: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      setCategories(cats);
      setProducts(prods);
      // default select first category if empty
      if (!form.categoryId && cats.length > 0) {
        setForm((p) => ({ ...p, categoryId: cats[0].id }));
      }
    } catch (e) {
        if (axios.isAxiosError(e) && e.response) {
      const msg =
            e?.response?.data?.message ||
            "Failed to load products/categories";
        setError(msg);
        } else {
      setError("Failed to load products/categories");
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => {
    if (!form.categoryId) return false;
    if (!normalizeCode(form.code)) return false;
    if (!form.name.trim()) return false;
    const price = Number(form.price);
    const qty = Number(form.quantity);
    if (!Number.isFinite(price) || price < 0) return false;
    if (!Number.isInteger(qty) || qty < 0) return false;
    return true;
  }, [form]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;

    try {
      const created = await createProduct({
        code: normalizeCode(form.code),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        quantity: Number(form.quantity),
        categoryId: form.categoryId,
      });
      setProducts((prev) => [created, ...prev]);
      setForm((p) => ({ ...p, code: "", name: "", description: "" }));
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
      const msg =
            err?.response?.data?.message ||
            "Failed to create product";
        setError(msg);
        } else {    
      setError("Failed to create product");
        }
    }
  };

  const handleDelete = async (p: ProductDto) => {
    const ok = window.confirm(`Delete product "${p.name}"?`);
    if (!ok) return;

    setError(null);
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {  
        const msg = 
                err?.response?.data?.message ||     
                "Failed to delete product";
          setError(msg);
        } else {
      setError( "Failed to delete product");
        }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded border p-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. PROD001"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. Consulting package"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="Short description…"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Price</label>
            <input
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Quantity</label>
            <input
              inputMode="numeric"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">No categories yet</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) — {c.type?.label ?? "—"}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Add Product
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No products yet.</p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p.id} className="rounded border px-3 py-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {p.name} <span className="text-gray-500">({p.code})</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {p.category?.name} • Qty: {p.quantity} • ${Number(p.price.toString()).toFixed(2)}
                  </div>
                  {p.description && <div className="text-sm text-gray-600 mt-1">{p.description}</div>}
                </div>
                <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="rounded border px-3 py-1 text-sm">
                    Edit
                </button>

                <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="rounded border px-3 py-1 text-sm">
                    Delete
                </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <EditProductModal
            isOpen={!!editing}
            product={editing}
            onClose={() => setEditing(null)}
            onUpdated={load}
        />   
    </div>
  );
}
