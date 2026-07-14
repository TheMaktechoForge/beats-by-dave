import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createServiceSupabase();
  const { data: orders } = await admin
    .from("orders")
    .select("id, payer_email, payer_name, items, total_cents, status, created_at, paypal_order_id")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black mb-8">Orders</h1>

      {(!orders || orders.length === 0) ? (
        <div className="card p-12 text-center text-[var(--color-text-muted)]">No orders yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Buyer</th>
                <th className="text-left p-3">Items</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const items = o.items as { beat_title: string; license: string }[];
                return (
                  <tr key={o.id} className="border-t border-[var(--color-border)]">
                    <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="p-3">
                      <div>{o.payer_email ?? "—"}</div>
                      {o.payer_name && <div className="text-xs text-[var(--color-text-dim)]">{o.payer_name}</div>}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {items.map((i) => `${i.beat_title} (${i.license})`).join(", ")}
                    </td>
                    <td className="p-3 font-bold">{formatPrice(o.total_cents)}</td>
                    <td className="p-3"><span className="text-xs">{o.status}</span></td>
                    <td className="p-3 text-[var(--color-text-muted)]">{new Date(o.created_at).toLocaleString("en-US")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}