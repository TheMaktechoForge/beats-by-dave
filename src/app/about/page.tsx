export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">About</div>
      <h1 className="text-4xl md:text-5xl font-black mb-6">Beats by Dave</h1>

      <div className="prose-invert space-y-4 text-[var(--color-text-muted)] leading-relaxed">
        <p>
          I'm a producer out of the Midwest making Hip-Hop, Trap, and R&B instrumentals.
          I started making beats because I wanted to hear certain sounds — and after enough of
          them piled up, I figured other people might want to hear them too.
        </p>
        <p>
          Every beat on this site is something I'd actually use. The mixes are clean, the
          808s knock without rattling your trunk apart, and the melodies hit somewhere
          between sad and confident.
        </p>
        <p>
          Licensing is simple: pick a tier, pay through PayPal, get the files instantly.
          The PDF license is included with every order so you know exactly what you bought.
        </p>
        <p>
          Need a custom beat, a specific vibe, or stems delivered in a different way?
          Hit me up on the contact page — I'll let you know if it's something I can do.
        </p>
      </div>
    </div>
  );
}