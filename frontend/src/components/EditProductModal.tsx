import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { getCategories, type CategoryDto } from "../api/category";
import { updateProduct, type ProductDto } from "../api/product";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDto | null;
  onUpdated: () => void;
};

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

export default function EditProductModal({ isOpen, onClose, product, onUpdated }: Props) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [form, setForm] = useState<FormState>({
    code: "",
    name: "",
    description: "",
    price: "0",
    quantity: "0",
    categoryId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // init form from product
    setForm({
      code: product?.code ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "0",
      quantity: product ? String(product.quantity) : "0",
      categoryId: product?.categoryId ?? "",
    });

    // load categories
    (async () => {
      setLoadingCats(true);
      try {
        const cats = await getCategories();
        setCategories(cats);

        if ((!product?.categoryId || product.categoryId === "") && cats.length > 0) {
          setForm((p) => ({ ...p, categoryId: cats[0].id }));
        }
      } catch (e) {
        console.log("Failed to load categories:", e);
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, [isOpen, product]);

  const validation = useMemo(() => {
    const code = normalizeCode(form.code);
    const name = form.name.trim();
    const price = Number(form.price);
    const qty = Number(form.quantity);

    if (!code) return { ok: false as const, message: "Code is required" };
    if (!name) return { ok: false as const, message: "Name is required" };
    if (!form.categoryId) return { ok: false as const, message: "Category is required" };

    if (!Number.isFinite(price) || price < 0) return { ok: false as const, message: "Price must be a number ≥ 0" };
    if (!Number.isInteger(qty) || qty < 0) return { ok: false as const, message: "Quantity must be an integer ≥ 0" };

    return { ok: true as const, message: "" };
  }, [form]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!product) return;
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    try {
      setSubmitting(true);
      await updateProduct(product.id, {
        code: normalizeCode(form.code),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        quantity: Number(form.quantity),
        categoryId: form.categoryId,
      });

      onClose();
      onUpdated();
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
      const msg =
            err?.response?.data?.message || 
            "Failed to update product";
        setError(msg);
        } else {    
      const msg = "Failed to update product";
        setError(msg);
        }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit product" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Code</label>
          <input
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Description (optional)</label>
          <input
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
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
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            className="w-full rounded border px-3 py-2"
            disabled={loadingCats || categories.length === 0}
          >
            {categories.length === 0 ? (
              <option value="">{loadingCats ? "Loading…" : "No categories"}</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) — {c.type?.label ?? "—"}
                </option>
              ))
            )}
          </select>
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-4 py-2">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !validation.ok}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
