import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="text-7xl font-black text-[var(--color-accent)] mb-4">404</div>
      <h1 className="text-2xl font-black mb-3">Beat not found</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        The page you're looking for doesn't exist or the beat was sold exclusively.
      </p>
      <Link href="/beats" className="btn-primary">Browse Beats</Link>
    </div>
  );
}