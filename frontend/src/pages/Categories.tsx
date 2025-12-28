import { useEffect, useState } from "react";
import axios from 'axios';
import CreateCategoryForm from "../components/CreateCategoryForm";
import EditCategoryModal from "../components/EditCategoryModal";
import { deleteCategory, getCategories, type CategoryDto } from "../api/category";

export default function Categories() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [editing, setEditing] = useState<CategoryDto | null>(null);

  const load = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg =
          err?.response?.data?.message ||
          "Failed to load categories";
        setPageError(msg);
      }
      else {
      setPageError("Failed to load categories");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (cat: CategoryDto) => {
    const ok = window.confirm(`Delete category "${cat.name}"?`);
    if (!ok) return;

    setPageError(null);
    try {
      await deleteCategory(cat.id);
      // optimistic remove
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg =
          err?.response?.data?.message ||
          "Failed to delete category";
        setPageError(msg);
      } else {
        setPageError("Unknown error during deletion");
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categories</h2>

      <div className="mb-6">
        <CreateCategoryForm onCreated={load} />
      </div>

      {pageError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {pageError}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-600">No categories yet.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.id} className="rounded border px-3 py-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {cat.name} <span className="text-gray-500">({cat.code})</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Type: {cat.type?.label ?? "—"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(cat)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditCategoryModal
        isOpen={!!editing}
        category={editing}
        onClose={() => setEditing(null)}
        onUpdated={load}
      />
    </div>
  );
}
