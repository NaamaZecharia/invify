import React, { useMemo, useState } from "react";
import { createCategoryType } from "../api/category";

type Props = {
  onCreated: (createdTypeId: string) => void;
  onCancel?: () => void;
};

function normalizeCode(v: string) {
  return v.trim().toUpperCase();
}

export default function CreateCategoryTypeForm({ onCreated, onCancel }: Props) {
  const [form, setForm] = useState({ code: "", label: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => {
    const code = normalizeCode(form.code);
    const label = form.label.trim();
    if (!code) return { ok: false as const, message: "Code is required" };
    if (!label) return { ok: false as const, message: "Label is required" };
    return { ok: true as const, message: "" };
  }, [form.code, form.label]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    try {
      setSubmitting(true);
      const created = await createCategoryType({
        code: normalizeCode(form.code),
        label: form.label.trim(),
      });

      onCreated(created.id);
      setForm({ code: "", label: "" });
    } catch (err) {
      console.log("Error creating category type:", err);
      setError("Failed to create category type");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="block text-sm font-medium">Type code</label>
        <input
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          placeholder="e.g. SERVICE"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
          placeholder="e.g. Service"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !validation.ok}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save type"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}