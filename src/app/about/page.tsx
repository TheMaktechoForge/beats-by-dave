import { getSignedUrl } from "@/lib/supabase";

export default async function AboutPage() {
  const faceUrl = await getSignedUrl("about/face.png");

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex flex-col items-center text-center mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faceUrl}
          alt="Beats by Dave"
          className="w-40 h-40 md:w-48 md:h-48 rounded-full border-2 border-[var(--color-accent)] object-cover shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] mb-6"
        />
        <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">The Producer</div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">Beats by Dave</h1>
        <p className="text-[var(--color-accent)] tracking-wide text-sm">
          Texas. Dirty South. 20+ years on the boards.
        </p>
      </div>

      <div className="prose-invert space-y-4 text-[var(--color-text-muted)] leading-relaxed">
        <p>
          From the heart of Texas, the Dirty South, Beats by Dave has been making beats by hand for over twenty years. Hip-Hop, Trap, and R&amp;B instrumentals, crafted the way it&apos;s always been done.
        </p>
        <p>
          No AI. No shortcuts. Every beat on this site was built from scratch on the hardware, dialed in, mixed, and tested by ear. If that ever changes, you&apos;ll see it noted right here first. No surprises.
        </p>
        <p>
          Every beat here is something I&apos;d actually use. The mixes are clean, the 808s knock without rattling your trunk apart, and the melodies land somewhere between sad and confident.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">Looking for custom work, a collab, or a beat made just for you?</strong> Hit the contact page and let&apos;s talk. Placements, full productions, exclusive work. Whatever you&apos;re building, if it&apos;s hip-hop, trap, or R&amp;B and you want it to hit different, I probably want to work on it.
        </p>
      </div>
    </div>
  );
}
