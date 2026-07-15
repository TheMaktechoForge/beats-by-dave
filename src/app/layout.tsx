import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Beats by Dave — Premium Hip-Hop, Trap & R&B Beats",
  description: "Buy exclusive and lease beats from producer Beats by Dave. Instant download, secure checkout.",
  openGraph: {
    title: "Beats by Dave",
    description: "Premium Hip-Hop, Trap & R&B Beats",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="page-marquee" aria-hidden="true">
          <div className="page-marquee__track">
            <span>● NEW BEAT DROP — SOUTHERN DOG 1</span>
            <span>● INSTANT DOWNLOAD — MP3 / WAV / STEMS</span>
            <span>● CUSTOM LICENSES — STARTING AT $14.99</span>
            <span>● EXCLUSIVE RIGHTS — NEGOTIABLE</span>
            <span>● NEW BEAT DROP — SOUTHERN DOG 1</span>
            <span>● INSTANT DOWNLOAD — MP3 / WAV / STEMS</span>
            <span>● CUSTOM LICENSES — STARTING AT $14.99</span>
            <span>● EXCLUSIVE RIGHTS — NEGOTIABLE</span>
          </div>
        </div>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}