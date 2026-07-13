export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">Terms</div>
      <h1 className="text-4xl md:text-5xl font-black mb-6">Terms of Use</h1>

      <div className="prose-invert space-y-4 text-[var(--color-text-muted)] leading-relaxed text-sm">
        <p>
          By purchasing a beat from Beats by Dave you agree to the license tier you selected
          (MP3 Lease, WAV Lease, Trackouts, or Exclusive Rights). The full license text is
          delivered as a PDF with every order and is the controlling document.
        </p>

        <h2 className="text-white font-bold pt-4">Standard terms (apply to MP3, WAV, Trackouts)</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>The license is non-exclusive and non-transferable.</li>
          <li>The licensee (you) owns 100% of the master and publishing rights to the resulting song, subject to a 50% publishing royalty to the producer.</li>
          <li>The producer must be credited: "Produced by Beats by Dave".</li>
          <li>Distribution caps per tier: MP3 — $10K, WAV — $50K, Trackouts — $250K gross revenue. Above the cap, upgrade to the next tier or contact for exclusive rights.</li>
          <li>Reselling the beat or redistributing the audio file is prohibited.</li>
        </ul>

        <h2 className="text-white font-bold pt-4">Exclusive Rights</h2>
        <p>
          Exclusive rights transfer full ownership of the master recording to the licensee.
          The producer retains 50% of publishing rights to the resulting song.
          The beat is delisted from the catalog upon sale.
        </p>

        <h2 className="text-white font-bold pt-4">Refunds</h2>
        <p>
          Because digital downloads are delivered immediately after purchase, all sales are final.
          If a file is corrupted or missing, contact us and we'll re-send the download link or
          issue a replacement.
        </p>

        <p className="pt-6 text-xs text-[var(--color-text-dim)]">
          This page is a summary, not legal advice. The PDF license delivered with each order is the binding agreement.
        </p>
      </div>
    </div>
  );
}