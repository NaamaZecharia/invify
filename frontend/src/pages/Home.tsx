import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

type InvoiceSummary = {
  id: string;
  customerName: string;
  total: number;
  status: InvoiceStatus;
  dueDate: string; // ISO string
};

type Stats = {
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
};

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [recent, setRecent] = useState<InvoiceSummary[]>([]);
  const stats: Stats = useMemo(() => {
    return recent.reduce(
      (acc, inv) => ({ ...acc, [inv.status]: acc[inv.status] + 1 }),
      { draft: 0, sent: 0, paid: 0, overdue: 0 }
    );
  }, [recent]);

  useEffect(() => {
    // simulate loading
    setTimeout(() => {
      setRecent([]); 
      setLoading(false);
    }, 200);
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Invify Dashboard</h1>
          <p style={{ marginTop: 6, color: "#555" }}>Quick view of invoices and activity</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/invoices/new" style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none" }}>
            + Create Invoice
          </Link>
          <Link to="/categories" style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none" }}>
            Categories
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
        <KpiCard title="Draft" value={stats.draft} />
        <KpiCard title="Sent" value={stats.sent} />
        <KpiCard title="Paid" value={stats.paid} />
        <KpiCard title="Overdue" value={stats.overdue} />
      </div>

      {/* Recent */}
      <div style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Recent invoices</h2>
          <Link to="/invoices" style={{ textDecoration: "none" }}>View all</Link>
        </div>

        {loading ? (
          <p style={{ marginTop: 12 }}>Loading…</p>
        ) : recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {recent.slice(0, 5).map((inv) => (
              <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    Due {new Date(inv.dueDate).toLocaleDateString("en-US")}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{formatMoney(inv.total)}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>{inv.status.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div style={{ color: "#666", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ marginTop: 12, padding: 14, border: "1px dashed #ccc", borderRadius: 12 }}>
      <div style={{ fontWeight: 700 }}>No invoices yet</div>
      <p style={{ marginTop: 6, color: "#555" }}>
        Create your first invoice to start tracking drafts, sent, and paid statuses.
      </p>
      <Link to="/invoices/new" style={{ display: "inline-block", marginTop: 6, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none" }}>
        + Create Invoice
      </Link>
    </div>
  );
}
