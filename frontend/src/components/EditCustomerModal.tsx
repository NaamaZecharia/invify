import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { updateCustomer, type CustomerDto } from "../api/customer";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDto | null;
  onUpdated: () => void;
};

type FormState = {
  firstName: string;
  LastName: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
};

export default function EditCustomerModal({ isOpen, onClose, customer, onUpdated }: Props) {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    LastName: "",
    phone: "",
    email: "",
    address: "",
    companyName: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // init form from customer
    setForm({
      firstName: customer?.firstName ?? "",
      LastName: customer?.LastName ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
      companyName: customer?.companyName ?? "",
    });
    setError(null);
  }, [isOpen, customer]);

  const validation = useMemo(() => {
    const firstName = form.firstName.trim();
    const lastName = form.LastName.trim();

    if (!firstName) return { ok: false as const, message: "First name is required" };
    if (!lastName) return { ok: false as const, message: "Last name is required" };

    return { ok: true as const, message: "" };
  }, [form.firstName, form.LastName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customer) return;
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    try {
      setSubmitting(true);
      await updateCustomer(customer.id, {
        firstName: form.firstName.trim(),
        LastName: form.LastName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
      });

      onClose();
      onUpdated();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg =
          err?.response?.data?.message ||
          "Failed to update customer";
        setError(msg);
      } else {
        const msg = "Failed to update customer";
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Customer" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

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
              value={form.LastName}
              onChange={(e) => setForm((p) => ({ ...p, LastName: e.target.value }))}
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

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!validation.ok || submitting}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
