import Link from "next/link";
import { createServiceSupabase } from "@/lib/supabase";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  let order: { id: string; total_cents: number } | null = null;

  if (token) {
    const supabase = createServiceSupabase();
    const { data } = await supabase
      .from("orders")
      .select("id, total_cents, created_at")
      .eq("download_token", token)
      .maybeSingle();
    order = data;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="text-6xl mb-4">🧡</div>
      <h1 className="text-3xl md:text-4xl font-black mb-3">Thanks for your purchase!</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Your payment was received and your download links are on the way to your inbox.
      </p>

      {token && (
        <Link
          href={`/api/download/${token}`}
          className="btn-primary text-base"
        >
          Download Your Beats
        </Link>
      )}

      {order && (
        <div className="mt-8 text-xs text-[var(--color-text-dim)]">
          Order #{order.id.slice(0, 8).toUpperCase()} • ${(order.total_cents / 100).toFixed(2)}
        </div>
      )}

      <div className="mt-12">
        <Link href="/beats" className="text-sm text-[var(--color-accent)] hover:underline">
          Keep browsing beats →
        </Link>
      </div>
    </div>
  );
}