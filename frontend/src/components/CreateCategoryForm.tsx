import React, { useEffect, useMemo, useState } from "react";
import { createCategory, getCategoryTypes, type CategoryTypeDto} from "../api/category";
import Modal from "./Modal";
import CreateCategoryTypeForm from "./CreateCategoryTypeForm";

type Props = { onCreated: () => void };

type FormState = {
  code: string;
  name: string;
  typeId?: string;
};

function normalizeCode(v: string) {
  return v.trim().toUpperCase();
}

export default function CreateCategoryForm({ onCreated }: Props) {
  const [form, setForm] = useState<FormState>({ code: "", name: "", typeId: undefined });
  const [types, setTypes] = useState<CategoryTypeDto[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const loadTypes = async () => {
    setLoadingTypes(true);
    try {
      const t = await getCategoryTypes();
      setTypes(t);
    } catch (e) {
      console.log("Failed to load category types:", e);
      setTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validation = useMemo(() => {
    const code = normalizeCode(form.code);
    const name = form.name.trim();
    if (!code) return { ok: false as const, message: "Code is required" };
    if (!name) return { ok: false as const, message: "Name is required" };
    return { ok: true as const, message: "" };
  }, [form.code, form.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    try {
      setSubmitting(true);
      await createCategory({
        code: normalizeCode(form.code),
        name: form.name.trim(),
        typeId: form.typeId || undefined,
      });

      onCreated();
      setForm({ code: "", name: "", typeId: undefined });
    } catch (err) {
      console.log("Error creating category:", err);
      setError("Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeCreated = async (createdTypeId: string) => {
    // Refresh list and auto-select the new type
    await loadTypes();
    setForm((p) => ({ ...p, typeId: createdTypeId }));
    setIsTypeModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Code</label>
          <input
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            placeholder="e.g. DEV"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Development"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium">Type (optional)</label>

            <button
              type="button"
              onClick={() => setIsTypeModalOpen(true)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              + Add new type
            </button>
          </div>

          <select
            value={form.typeId ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, typeId: e.target.value || undefined }))}
            className="w-full rounded border px-3 py-2"
            disabled={loadingTypes}
          >
            <option value="">{loadingTypes ? "Loading…" : "Select type…"}</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {types.length === 0 && !loadingTypes && (
            <p className="text-xs text-gray-500">
              No types found yet. Add one using “Add new type”.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !validation.ok}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add Category"}
        </button>
      </form>

      <Modal
        title="Create category type"
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
      >
        <CreateCategoryTypeForm
          onCreated={handleTypeCreated}
          onCancel={() => setIsTypeModalOpen(false)}
        />
      </Modal>
    </>
  );
}