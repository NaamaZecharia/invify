import React, { useEffect, useMemo, useState } from "react";
import axios from 'axios';
import Modal from "./Modal";
import { getCategoryTypes, updateCategory, type CategoryDto, type CategoryTypeDto} from "../api/category";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryDto | null;
  onUpdated: () => void;
};

function normalizeCode(v: string) {
  return v.trim().toUpperCase();
}

export default function EditCategoryModal({ isOpen, onClose, category, onUpdated }: Props) {
  const [types, setTypes] = useState<CategoryTypeDto[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [form, setForm] = useState<{ code: string; name: string; typeId?: string }>({
    code: "",
    name: "",
    typeId: undefined,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // init form
    setForm({
      code: category?.code ?? "",
      name: category?.name ?? "",
      typeId: category?.typeId ?? undefined,
    });

    // load types
    (async () => {
      setLoadingTypes(true);
      try {
        const t = await getCategoryTypes();
        setTypes(t);
      } catch (e) {
        console.log("Failed to load types:", e);
        setTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, [isOpen, category]);

  const validation = useMemo(() => {
    const code = normalizeCode(form.code);
    const name = form.name.trim();
    if (!code) return { ok: false as const, message: "Code is required" };
    if (!name) return { ok: false as const, message: "Name is required" };
    return { ok: true as const, message: "" };
  }, [form.code, form.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) return;
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    try {
      setSubmitting(true);
      await updateCategory(category.id, {
        code: normalizeCode(form.code),
        name: form.name.trim(),
        typeId: form.typeId || undefined,
      });
      onClose();
      onUpdated();
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
      const msg =
            err?.response?.data?.message ||
            "Failed to update category";
        setError(msg);
        }
        else {  
        setError("Unknown error during update");    
        }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit category" isOpen={isOpen} onClose={onClose}>
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
          <label className="block text-sm font-medium">Type (optional)</label>
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
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
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
