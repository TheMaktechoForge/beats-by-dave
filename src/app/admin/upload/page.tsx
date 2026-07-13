"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Field = "preview" | "mp3" | "wav" | "trackouts" | "cover";

interface DroppedFile {
  field: Field;
  file: File;
}

export default function AdminUploadPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Partial<Record<Field, File>>>({});
  const [dragOver, setDragOver] = useState<Field | null>(null);

  const [form, setForm] = useState({
    title: "",
    genre: "Trap",
    mood: "",
    bpm: "",
    musical_key: "",
    description: "",
    price_mp3: "29.99",
    price_wav: "49.99",
    price_trackouts: "99.99",
    price_exclusive: "499.99",
    published: true,
    featured: false,
  });

  const onDrop = useCallback((field: Field, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const f = e.dataTransfer.files[0];
    if (f) setFiles((prev) => ({ ...prev, [field]: f }));
  }, []);

  const onPick = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFiles((prev) => ({ ...prev, [field]: f }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.preview) {
      setError("Preview MP3 is required.");
      return;
    }
    if (!form.title) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError(null);

    const fd = new FormData();
    Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      router.push("/admin/beats");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black mb-2">Upload Beat</h1>
      <p className="text-[var(--color-text-muted)] text-sm mb-8">
        Drag and drop your files. Preview MP3 is required.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <Grid>
          <Input label="Beat Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <Input label="Genre" value={form.genre} onChange={(v) => setForm({ ...form, genre: v })} />
          <Input label="Mood" value={form.mood} onChange={(v) => setForm({ ...form, mood: v })} />
          <Input label="BPM" type="number" value={form.bpm} onChange={(v) => setForm({ ...form, bpm: v })} />
          <Input label="Key" value={form.musical_key} onChange={(v) => setForm({ ...form, musical_key: v })} />
          <div />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
        </Grid>

        <h2 className="font-bold pt-2">Files</h2>
        <Grid>
          <Drop
            label="Preview MP3 (30–60s, tagged)"
            sub="Required. Plays on the site."
            file={files.preview}
            active={dragOver === "preview"}
            onDragOver={() => setDragOver("preview")}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop("preview", e)}
            onPick={onPick("preview")}
            required
          />
          <Drop
            label="Cover Art"
            sub="JPG/PNG, square"
            file={files.cover}
            active={dragOver === "cover"}
            onDragOver={() => setDragOver("cover")}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop("cover", e)}
            onPick={onPick("cover")}
          />
          <Drop
            label="Full MP3"
            sub="Delivered to buyers"
            file={files.mp3}
            active={dragOver === "mp3"}
            onDragOver={() => setDragOver("mp3")}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop("mp3", e)}
            onPick={onPick("mp3")}
          />
          <Drop
            label="Full WAV"
            sub="Delivered to WAV+ buyers"
            file={files.wav}
            active={dragOver === "wav"}
            onDragOver={() => setDragOver("wav")}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop("wav", e)}
            onPick={onPick("wav")}
          />
          <Drop
            label="Trackouts / Stems (ZIP)"
            sub="Delivered to Trackouts buyers"
            file={files.trackouts}
            active={dragOver === "trackouts"}
            onDragOver={() => setDragOver("trackouts")}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop("trackouts", e)}
            onPick={onPick("trackouts")}
          />
        </Grid>

        <h2 className="font-bold pt-2">Pricing (USD)</h2>
        <Grid>
          <Input label="MP3 Lease" value={form.price_mp3} onChange={(v) => setForm({ ...form, price_mp3: v })} />
          <Input label="WAV Lease" value={form.price_wav} onChange={(v) => setForm({ ...form, price_wav: v })} />
          <Input label="Trackouts" value={form.price_trackouts} onChange={(v) => setForm({ ...form, price_trackouts: v })} />
          <Input label="Exclusive" value={form.price_exclusive} onChange={(v) => setForm({ ...form, price_exclusive: v })} />
        </Grid>

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published (visible on site)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured on home page
          </label>
        </div>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Uploading…" : "Publish Beat"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 focus:border-[var(--color-accent)] focus:outline-none"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm md:col-span-2">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 focus:border-[var(--color-accent)] focus:outline-none"
      />
    </label>
  );
}

function Drop({
  label, sub, file, active, onDragOver, onDragLeave, onDrop, onPick, required,
}: {
  label: string; sub?: string; file?: File; active: boolean;
  onDragOver: () => void; onDragLeave: () => void; onDrop: (e: React.DragEvent) => void;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  return (
    <div>
      <span className="block text-sm text-[var(--color-text-muted)] mb-1">
        {label} {required && <span className="text-[var(--color-accent)]">*</span>}
      </span>
      <label
        onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
          active
            ? "border-[var(--color-accent)] bg-[var(--color-bg-card)]"
            : "border-[var(--color-border)] hover:border-[var(--color-text-dim)]"
        }`}
      >
        <input type="file" className="hidden" onChange={onPick} />
        {file ? (
          <div className="text-sm">
            <div className="font-medium text-[var(--color-accent)]">✓ {file.name}</div>
            <div className="text-[var(--color-text-dim)] text-xs mt-1">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
        ) : (
          <div className="text-sm text-[var(--color-text-muted)]">
            <div className="text-2xl mb-1">⬇</div>
            <div>Drop file here or click to choose</div>
            {sub && <div className="text-xs text-[var(--color-text-dim)] mt-1">{sub}</div>}
          </div>
        )}
      </label>
    </div>
  );
}