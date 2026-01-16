import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getOrders, type OrderDto } from "../api/order";
import { getCustomers, type CustomerDto } from "../api/customer";
import OrderEditorModal  from "../components/OrderEditorModal";
import { confirmOrder } from "../api/order";

type FilterState = {
  customerId: string;
  dateFrom: string;
  dateTo: string;
  itemSearch: string;
  totalMin: string;
  totalMax: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    customerId: "",
    dateFrom: "",
    dateTo: "",
    itemSearch: "",
    totalMin: "",
    totalMax: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, customersData] = await Promise.all([getOrders(), getCustomers()]);
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const msg = e?.response?.data?.message || "Failed to load orders";
        setError(msg);
      } else {
        setError("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by customer
      if (filters.customerId && order.customerId !== filters.customerId) {
        return false;
      }

      // Filter by date range
      if (filters.dateFrom) {
        const orderDate = new Date(order.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const orderDate = new Date(order.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (orderDate > toDate) return false;
      }

      // Filter by item name
      if (filters.itemSearch) {
        const searchLower = filters.itemSearch.toLowerCase();
        const hasMatchingItem = order.items.some(
          (item) => item.name.toLowerCase().includes(searchLower)
        );
        if (!hasMatchingItem) return false;
      }

      // Filter by total range
      const total = Number(order.total ?? 0);
      if (filters.totalMin) {
        const min = parseFloat(filters.totalMin);
        if (isNaN(min) || total < min) return false;
      }
      if (filters.totalMax) {
        const max = parseFloat(filters.totalMax);
        if (isNaN(max) || total > max) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const clearFilters = () => {
    setFilters({
      customerId: "",
      dateFrom: "",
      dateTo: "",
      itemSearch: "",
      totalMin: "",
      totalMax: "",
    });
  };

  const formatMoney = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "FULFILLED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <button
          onClick={() => { setOpenCreate(true);}}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          + Add New Order
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded border p-4 bg-gray-50">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear All
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Customer</label>
            <select
              value={filters.customerId}
              onChange={(e) => setFilters((p) => ({ ...p, customerId: e.target.value }))}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} {c.companyName ? `(${c.companyName})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Item Search</label>
            <input
              type="text"
              value={filters.itemSearch}
              onChange={(e) => setFilters((p) => ({ ...p, itemSearch: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="Search by item name..."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Total Min ($)</label>
            <input
              type="number"
              step="0.01"
              value={filters.totalMin}
              onChange={(e) => setFilters((p) => ({ ...p, totalMin: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Total Max ($)</label>
            <input
              type="number"
              step="0.01"
              value={filters.totalMax}
              onChange={(e) => setFilters((p) => ({ ...p, totalMax: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <p>Loading…</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-600">
          {orders.length === 0 ? "No orders yet." : "No orders match the current filters."}
        </p>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
          </div>
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded border px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-semibold">
                      Order #{order.id.slice(0, 8)} • {formatDate(order.createdAt)}
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div>
                      Customer: {order.customer.firstName} {order.customer.lastName}
                      {order.customer.companyName && (
                        <span className="text-gray-500"> ({order.customer.companyName})</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-2 text-sm">
                    <div className="font-medium">Items:</div>
                    <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.name} × {item.quantity} @ {formatMoney(item.unitPrice)} ={" "}
                          {formatMoney(item.lineTotal)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Subtotal:</span>{" "}
                      <span className="font-medium">{formatMoney(order.subtotal)}</span>
                    </div>
                    {parseFloat(order.taxTotal) > 0 && (
                      <div>
                        <span className="text-gray-600">Tax:</span>{" "}
                        <span className="font-medium">{formatMoney(order.taxTotal)}</span>
                      </div>
                    )}
                    {parseFloat(order.discountTotal) > 0 && (
                      <div>
                        <span className="text-gray-600">Discount:</span>{" "}
                        <span className="font-medium">-{formatMoney(order.discountTotal)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Total:</span>{" "}
                      <span className="font-bold text-lg">{formatMoney(order.total)}</span>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </div>
                  )}
                </div>
                {order.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = window.confirm("Confirm this order? You won’t be able to edit items after.");
                        if (!ok) return;
                        await confirmOrder(order.id);
                        await load();
                      }}
                      className="rounded bg-blue-600 px-3 py-1 text-white text-sm hover:bg-blue-700"
                    >
                      Confirm
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
      <OrderEditorModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={load}
      />
    </div>
  );
}
