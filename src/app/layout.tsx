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
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}