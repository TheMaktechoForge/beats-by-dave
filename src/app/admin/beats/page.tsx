import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminBeatsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createServiceSupabase();
  const { data: beats } = await admin
    .from("beats")
    .select("id, slug, title, genre, bpm, published, exclusive_sold, price_mp3_cents, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Beats</h1>
        <Link href="/admin/upload" className="btn-primary">+ Upload Beat</Link>
      </div>

      {(!beats || beats.length === 0) ? (
        <div className="card p-12 text-center text-[var(--color-text-muted)]">
          No beats yet. Upload your first one.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Genre</th>
                <th className="text-left p-3">BPM</th>
                <th className="text-left p-3">From</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {beats.map((b) => (
                <tr key={b.id} className="border-t border-[var(--color-border)]">
                  <td className="p-3">
                    <Link href={`/beats/${b.slug}`} className="font-bold hover:text-[var(--color-accent)]">
                      {b.title}
                    </Link>
                  </td>
                  <td className="p-3 text-[var(--color-text-muted)]">{b.genre ?? "—"}</td>
                  <td className="p-3">{b.bpm ?? "—"}</td>
                  <td className="p-3">{b.price_mp3_cents ? formatPrice(b.price_mp3_cents) : "—"}</td>
                  <td className="p-3">
                    {b.exclusive_sold ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)]">Sold (Exclusive)</span>
                    ) : b.published ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Live</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-500/20 text-zinc-300">Draft</span>
                    )}
                  </td>
                  <td className="p-3 text-[var(--color-text-muted)]">{new Date(b.created_at).toLocaleDateString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}