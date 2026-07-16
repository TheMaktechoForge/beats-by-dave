// License tier definitions and PDF generation.
// The terms here are intentionally conservative. Producers should
// have a lawyer review before going exclusive-heavy. For Chase's
// first site this is good enough to actually sell — not airtight
// for litigation, but standard for the indie beat space.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { LicenseTier } from "./types";

export interface LicenseMeta {
  key: LicenseTier;
  label: string;
  shortLabel: string;
  description: string;
  // Returns the field name on a beat row that holds the price in cents.
  priceField: "price_mp3_cents" | "price_wav_cents" | "price_trackouts_cents" | "price_exclusive_cents";
  // File extensions granted, in order of preference. The download
  // route will pick the best match from the beat's storage paths.
  filePreference: ("wav" | "mp3" | "trackouts")[];
  // Whether this tier is for exclusive rights transfer.
  exclusive: boolean;
}

export const LICENSES: Record<LicenseTier, LicenseMeta> = {
  audio: {
    key: "audio",
    label: "Audio File",
    shortLabel: "Audio",
    description: "Untagged MP3 + WAV. For streams and sales under $50K gross revenue.",
    priceField: "price_mp3_cents",
    filePreference: ["wav", "mp3"],
    exclusive: false,
  },
  exclusive: {
    key: "exclusive",
    label: "Full Rights",
    shortLabel: "Exclusive",
    description: "Full exclusive transfer of master recording rights. Beat delisted on sale. Negotiated per-beat with revenue-based clauses.",
    priceField: "price_exclusive_cents",
    filePreference: ["trackouts", "wav"],
    exclusive: true,
  },
};

export const LICENSE_TIERS: LicenseTier[] = ["audio", "exclusive"];

export function priceForLicense(
  beat: { price_mp3_cents: number | null; price_wav_cents: number | null; price_trackouts_cents: number | null; price_exclusive_cents: number | null },
  tier: LicenseTier
): number | null {
  const meta = LICENSES[tier];
  return beat[meta.priceField];
}

// ----- PDF GENERATION -----------------------------------------------------

interface PdfInput {
  producerName: string;
  beatTitle: string;
  buyerName?: string | null;
  buyerEmail?: string | null;
  license: LicenseTier;
  priceCents: number;
  orderId: string;
  purchaseDate: string;
}

export async function generateLicensePdf(input: PdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // US Letter
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.08, 0.08, 0.1);
  const accent = rgb(0.95, 0.55, 0.05);
  const muted = rgb(0.45, 0.45, 0.5);

  let y = 740;

  // Header
  page.drawText("BEATS BY DAVE", { x: 50, y, size: 11, font: bold, color: accent });
  page.drawText("LICENSE AGREEMENT", { x: 50, y: y - 18, size: 22, font: bold, color: ink });
  page.drawText(`Order #${input.orderId.slice(0, 8).toUpperCase()}`, {
    x: 50, y: y - 38, size: 9, font, color: muted,
  });
  page.drawText(`Issued ${new Date(input.purchaseDate).toLocaleDateString("en-US")}`, {
    x: 450, y: y - 38, size: 9, font, color: muted,
  });

  y -= 80;
  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 0.5, color: muted });

  // Parties
  y -= 24;
  page.drawText("PRODUCER", { x: 50, y, size: 9, font: bold, color: muted });
  page.drawText(input.producerName, { x: 50, y: y - 14, size: 12, font, color: ink });

  page.drawText("LICENSEE", { x: 320, y, size: 9, font: bold, color: muted });
  page.drawText(input.buyerName || "—", { x: 320, y: y - 14, size: 12, font, color: ink });
  page.drawText(input.buyerEmail || "", { x: 320, y: y - 28, size: 10, font, color: muted });

  // Beat + license
  y -= 70;
  page.drawText("BEAT", { x: 50, y, size: 9, font: bold, color: muted });
  page.drawText(input.beatTitle, { x: 50, y: y - 14, size: 14, font: bold, color: ink });

  page.drawText("LICENSE TYPE", { x: 320, y, size: 9, font: bold, color: muted });
  page.drawText(LICENSES[input.license].label, { x: 320, y: y - 14, size: 14, font: bold, color: ink });

  page.drawText("AMOUNT PAID", { x: 320, y: y - 32, size: 9, font: bold, color: muted });
  page.drawText(`$${(input.priceCents / 100).toFixed(2)} USD`, {
    x: 320, y: y - 46, size: 12, font, color: ink,
  });

  // Terms
  y -= 100;
  page.drawText("TERMS", { x: 50, y, size: 9, font: bold, color: muted });

  const terms = licenseTerms(input.license, input.beatTitle);
  for (const line of terms) {
    y -= 16;
    if (y < 80) break; // simple overflow guard
    page.drawText(line, { x: 50, y, size: 10, font, color: ink, maxWidth: 512 });
  }

  // Footer
  page.drawText(
    "This license is a non-exclusive agreement unless Full Rights are purchased. " +
      "By downloading the beat, the Licensee agrees to the full terms at beats.themaktechoforge.com/terms.",
    { x: 50, y: 50, size: 8, font, color: muted, maxWidth: 512, lineHeight: 10 }
  );

  return pdf.save();
}

function licenseTerms(tier: LicenseTier, beatTitle: string): string[] {
  const base = [
    `1. The Producer ("Beats by Dave") grants the Licensee a non-transferable license to use the audio recording titled "${beatTitle}" (the "Beat").`,
    "2. The Licensee shall credit the Producer as follows: 'Produced by Beats by Dave' in all metadata, liner notes, and visible credits where applicable.",
    "3. The Licensee may modify the Beat for the purpose of the Licensee's original musical composition (the 'Song').",
    "4. The Licensee retains 100% of the publishing and master ownership of the resulting Song, subject to the Producer's royalty share defined below.",
  ];
  if (tier === "audio") {
    return [
      ...base,
      "5. Distribution cap: streams and sales of the Song shall not exceed US$50,000 in gross revenue without purchasing Full Rights.",
      "6. The Licensee receives the Beat as untagged MP3 and WAV files (24-bit, 44.1 kHz).",
      "7. Royalty: Producer receives 50% of net publishing income from the Song.",
    ];
  }
  // exclusive
  return [
    `1. The Producer transfers all right, title, and interest in the master recording of the Beat titled "${beatTitle}" to the Licensee.`,
    "2. The Beat shall be delisted from the Producer's catalog upon execution of this agreement.",
    "3. The Producer retains 50% of publishing rights to the resulting Song.",
    "4. The Licensee receives untagged WAV stems and the original project session files (if available).",
    "5. The Producer agrees not to license the Beat to any other party after the effective date of this agreement.",
    "6. This agreement supersedes any prior non-exclusive license granted for the same Beat.",
  ];
}
