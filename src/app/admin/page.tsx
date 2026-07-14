import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createServiceSupabase();
  const [beatsR, ordersR] = await Promise.all([
    admin.from("beats").select("id, title, published, exclusive_sold, plays, created_at"),
    admin.from("orders").select("id, payer_email, items, total_cents, status, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const beats = beatsR.data ?? [];
  const orders = ordersR.data ?? [];

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const revenueToday = orders
    .filter((o) => o.status === "paid" && new Date(o.created_at) >= todayStart)
    .reduce((s, o) => s + o.total_cents, 0);
  const revenueMonth = orders
    .filter((o) => o.status === "paid" && new Date(o.created_at) >= monthStart)
    .reduce((s, o) => s + o.total_cents, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">Dashboard</div>
          <h1 className="text-3xl font-black">Welcome back, {user.email}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/upload" className="btn-primary">+ Upload Beat</Link>
          <Link href="/admin/beats" className="btn-ghost">Manage Beats</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card label="Revenue Today" value={formatPrice(revenueToday)} />
        <Card label="Revenue This Month" value={formatPrice(revenueMonth)} />
        <Card label="Total Beats" value={String(beats.length)} />
        <Card label="Recent Orders" value={String(orders.length)} />
      </div>

      <h2 className="font-bold mb-3">Recent Orders</h2>
      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)]">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
              <tr>
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
                    <td className="p-3">{o.payer_email ?? "—"}</td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {items.map((i) => `${i.beat_title} (${i.license})`).join(", ")}
                    </td>
                    <td className="p-3 font-bold">{formatPrice(o.total_cents)}</td>
                    <td className="p-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {new Date(o.created_at).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--color-text-dim)]">{label}</div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-green-500/20 text-green-300",
    pending: "bg-yellow-500/20 text-yellow-300",
    failed: "bg-red-500/20 text-red-300",
    refunded: "bg-zinc-500/20 text-zinc-300",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}