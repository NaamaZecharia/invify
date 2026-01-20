import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getProducts, type ProductDto } from "../api/product";
import { getCustomers, type CustomerDto } from "../api/customer";
import { createOrder, type CreateOrderItemInput } from "../api/order";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void; // parent reloads orders
};

type CartItem =
  | { kind: "product"; productId: string; quantity: number }
  | { kind: "custom"; name: string; unitPrice: string; quantity: number; description?: string };

function moneyToNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function OrderEditorModal({ isOpen, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [taxTotal, setTaxTotal] = useState("0");
  const [discountTotal, setDiscountTotal] = useState("0");
  const [productSearch, setProductSearch] = useState("");

  // cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // custom item form
  const [customName, setCustomName] = useState("");
  const [customUnitPrice, setCustomUnitPrice] = useState("0");
  const [customQty, setCustomQty] = useState(1);

  // Load modal data when opened
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prods, custs] = await Promise.all([getProducts(), getCustomers()]);
        setProducts(prods);
        setCustomers(custs);

        // default select first customer
        if (!customerId && custs.length > 0) setCustomerId(custs[0].id);
      } catch (e) {
        if (axios.isAxiosError(e) && e.response) {
          setError(e.response.data?.message || "Failed to load data");
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset when closing
  useEffect(() => {
    if (isOpen) return;
    setError(null);
    setNotes("");
    setTaxTotal("0");
    setDiscountTotal("0");
    setProductSearch("");
    setCart([]);
    setCustomName("");
    setCustomUnitPrice("0");
    setCustomQty(1);
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const categoryName = p.category?.name ?? "";
      const typeLabel = p.category?.type?.label ?? "";
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        typeLabel.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  const cartEnriched = useMemo(() => {
    // Build display rows for cart (resolve product details)
    return cart.map((c) => {
      if (c.kind === "product") {
        const p = products.find((x) => x.id === c.productId);
        const unit = p ? Number(p.price) : 0;
        const line = unit * c.quantity;
        return {
          key: `p:${c.productId}`,
          kind: c.kind,
          name: p ? `${p.name} (${p.code})` : "Unknown product",
          category: p?.category?.name ?? "—",
          type: p?.category?.type?.label ?? "—",
          quantity: c.quantity,
          unitPrice: unit,
          lineTotal: line,
          canInc: true,
          canDec: c.quantity > 1,
        };
      }
      const unit = moneyToNumber(c.unitPrice);
      const line = unit * c.quantity;
      return {
        key: `c:${c.name}:${c.unitPrice}`,
        kind: c.kind,
        name: c.name || "Custom item",
        category: "Custom",
        type: "Custom",
        quantity: c.quantity,
        unitPrice: unit,
        lineTotal: line,
        canInc: true,
        canDec: c.quantity > 1,
      };
    });
  }, [cart, products]);

  const subtotal = useMemo(() => cartEnriched.reduce((acc, x) => acc + x.lineTotal, 0), [cartEnriched]);
  const taxNum = moneyToNumber(taxTotal);
  const discountNum = moneyToNumber(discountTotal);
  const total = Math.max(0, subtotal + taxNum - discountNum);

  const canSave = useMemo(() => {
    if (!customerId) return false;
    if (cart.length === 0) return false;
    if (taxNum < 0 || discountNum < 0) return false;
    if (subtotal + taxNum - discountNum < 0) return false;
    // validate cart items
    for (const item of cart) {
      if (item.kind === "product") {
        if (!item.productId) return false;
        if (!Number.isInteger(item.quantity) || item.quantity < 1) return false;
      } else {
        if (!item.name.trim()) return false;
        if (!Number.isInteger(item.quantity) || item.quantity < 1) return false;
        if (moneyToNumber(item.unitPrice) < 0) return false;
      }
    }
    return true;
  }, [customerId, cart, taxNum, discountNum, subtotal]);

  const addProductToCart = (productId: string) => {
    setCart((prev) => {
      // If already in cart, increase quantity
      const idx = prev.findIndex((x) => x.kind === "product" && x.productId === productId);
      if (idx >= 0) {
        const copy = [...prev];
        const cur = copy[idx] as Extract<CartItem, { kind: "product" }>;
        copy[idx] = { ...cur, quantity: cur.quantity + 1 };
        return copy;
      }
      return [{ kind: "product", productId, quantity: 1 }, ...prev];
    });
  };

  const addCustomItem = () => {
    const name = customName.trim();
    if (!name) return;
    if (!Number.isInteger(customQty) || customQty < 1) return;
    if (moneyToNumber(customUnitPrice) < 0) return;

    setCart((prev) => [
      { kind: "custom", name, unitPrice: customUnitPrice, quantity: customQty },
      ...prev,
    ]);
    setCustomName("");
    setCustomUnitPrice("0");
    setCustomQty(1);
  };

  const updateCartQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        const itemKey =
          item.kind === "product"
            ? `p:${item.productId}`
            : `c:${item.name}:${item.unitPrice}`;
        if (itemKey !== key) return item;
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty } as CartItem;
      })
    );
  };

  const removeCartItem = (key: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        const itemKey =
          item.kind === "product"
            ? `p:${item.productId}`
            : `c:${item.name}:${item.unitPrice}`;
        return itemKey !== key;
      })
    );
  };

  const handleSave = async () => {
    setError(null);
    if (!canSave) return;

    const items: CreateOrderItemInput[] = cart.map((c) => {
      if (c.kind === "product") {
        return { productId: c.productId, quantity: c.quantity };
      }
      return {
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        description: c.description,
      };
    });

    try {
      setSaving(true);
      await createOrder({
        customerId,
        notes: notes.trim() || undefined,
        taxTotal: taxTotal || "0",
        discountTotal: discountTotal || "0",
        items,
      });
      onClose();
      onCreated();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        setError(e.response.data?.message || "Failed to create order");
      } else {
        setError("Failed to create order");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-6xl rounded bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <div className="text-lg font-semibold">Create Order</div>
            <div className="text-xs text-gray-500">Pick products, add custom items, then save.</div>
          </div>
          <button onClick={onClose} className="rounded border px-3 py-1 text-sm">
            Close
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {/* LEFT: Product picker */}
          <div className="rounded border">
            <div className="border-b p-3">
              <div className="flex items-end justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Customer</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                    disabled={loading || customers.length === 0}
                  >
                    {customers.length === 0 ? (
                      <option value="">No customers yet</option>
                    ) : (
                      customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} {c.companyName ? `(${c.companyName})` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium">Search Products</label>
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="Search by name, code, category, type…"
                />
              </div>
            </div>

            <div className="max-h-[420px] overflow-auto">
              {loading ? (
                <div className="p-3 text-sm text-gray-600">Loading…</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-3 text-sm text-gray-600">No products found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-left">
                    <tr className="border-b">
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{p.code}</td>
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2 text-gray-600">{p.category?.name ?? "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{p.category?.type?.label ?? "—"}</td>
                        <td className="px-3 py-2 text-right">{formatMoney(Number(p.price))}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => addProductToCart(p.id)}
                            className="rounded bg-black px-3 py-1 text-xs text-white hover:bg-gray-800"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Custom item footer */}
            <div className="border-t p-3">
              <div className="text-sm font-medium mb-2">Add Custom Item</div>
              <div className="grid gap-2 md:grid-cols-4">
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="rounded border px-3 py-2 md:col-span-2"
                  placeholder="e.g. Delivery fee"
                />
                <input
                  inputMode="decimal"
                  value={customUnitPrice}
                  onChange={(e) => setCustomUnitPrice(e.target.value)}
                  className="rounded border px-3 py-2"
                  placeholder="Unit price"
                />
                <input
                  type="number"
                  value={customQty}
                  min={1}
                  onChange={(e) => setCustomQty(Number(e.target.value))}
                  className="rounded border px-3 py-2"
                  placeholder="Qty"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="rounded border px-3 py-1 text-sm"
                >
                  + Add custom
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Cart */}
          <div className="rounded border">
            <div className="border-b p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Order Items</div>
                <div className="text-xs text-gray-500">{cart.length} item(s)</div>
              </div>
            </div>

            <div className="max-h-[420px] overflow-auto">
              {cartEnriched.length === 0 ? (
                <div className="p-3 text-sm text-gray-600">Cart is empty. Add products on the left.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-left">
                    <tr className="border-b">
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit</th>
                      <th className="px-3 py-2 text-right">Line</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartEnriched.map((it) => (
                      <tr key={it.key} className="border-b">
                        <td className="px-3 py-2 font-medium">{it.name}</td>
                        <td className="px-3 py-2 text-gray-600">{it.category}</td>
                        <td className="px-3 py-2 text-gray-600">{it.type}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateCartQty(it.key, -1)}
                              className="rounded border px-2 py-0.5 text-xs"
                              disabled={!it.canDec}
                            >
                              -
                            </button>
                            <span className="min-w-[24px] text-center">{it.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(it.key, 1)}
                              className="rounded border px-2 py-0.5 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">{formatMoney(it.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatMoney(it.lineTotal)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeCartItem(it.key)}
                            className="rounded border px-3 py-1 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Summary */}
            <div className="border-t p-3 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">Tax</label>
                  <input
                    inputMode="decimal"
                    value={taxTotal}
                    onChange={(e) => setTaxTotal(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Discount</label>
                  <input
                    inputMode="decimal"
                    value={discountTotal}
                    onChange={(e) => setDiscountTotal(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>
              </div>

              <div className="rounded bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatMoney(taxNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium">- {formatMoney(discountNum)}</span>
                </div>
                <div className="mt-2 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatMoney(total)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border px-4 py-2 text-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Create Order"}
                </button>
              </div>

              {!canSave && (
                <div className="text-xs text-gray-500">
                  Select a customer and add at least one item. Total cannot be negative.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t px-5 py-3 text-xs text-gray-500">
          Tip: This modal is designed to be reused later for “Edit DRAFT Order” by preloading cart
          from the order.
        </div>
      </div>
    </div>
  );
}