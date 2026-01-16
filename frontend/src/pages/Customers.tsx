import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EditCustomerModal from "../components/EditCustomerModal";
import { createCustomer, deleteCustomer, getCustomers, type CustomerDto } from "../api/customer";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
};

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [editing, setEditing] = useState<CustomerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    companyName: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const msg =
          e?.response?.data?.message ||
          "Failed to load customers";
        setError(msg);
      } else {
        setError("Failed to load customers");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canSubmit = useMemo(() => {
    if (!form.firstName.trim()) return false;
    if (!form.lastName.trim()) return false;
    return true;
  }, [form]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;

    try {
      const created = await createCustomer({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
      });
      setCustomers((prev) => [created, ...prev]);
      setForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        companyName: "",
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg =
          err?.response?.data?.message ||
          "Failed to create customer";
        setError(msg);
      } else {
        setError("Failed to create customer");
      }
    }
  };

  const handleDelete = async (c: CustomerDto) => {
    const ok = window.confirm(`Delete customer "${c.firstName} ${c.lastName}"?`);
    if (!ok) return;

    setError(null);
    try {
      await deleteCustomer(c.id);
      setCustomers((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg =
          err?.response?.data?.message ||
          "Failed to delete customer";
        setError(msg);
      } else {
        setError("Failed to delete customer");
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customers</h2>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded border p-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium">First Name *</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. John"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Last Name *</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. Doe"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. +1-555-123-4567"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. john@example.com"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. 123 Main St, City, State ZIP"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium">Company Name</label>
            <input
              value={form.companyName}
              onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Add Customer
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-gray-600">No customers yet.</p>
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id} className="rounded border px-3 py-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold">
                    {c.firstName} {c.lastName}
                    {c.companyName && (
                      <span className="text-gray-500 ml-2">({c.companyName})</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    {c.email && <div>📧 {c.email}</div>}
                    {c.phone && <div>📞 {c.phone}</div>}
                    {c.address && <div>📍 {c.address}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
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
      <EditCustomerModal
        isOpen={!!editing}
        customer={editing}
        onClose={() => setEditing(null)}
        onUpdated={load}
      />
    </div>
  );
}
