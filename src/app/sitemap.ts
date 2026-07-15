import type { MetadataRoute } from "next";
import { createServiceSupabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beats.themaktechoforge.com";
  const supabase = createServiceSupabase();
  const { data: beats } = await supabase
    .from("beats")
    .select("slug, updated_at")
    .eq("published", true);

  const staticRoutes = ["", "/beats", "/licenses", "/about", "/contact", "/terms"].map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1.0 : 0.7,
  }));

  const beatRoutes = (beats ?? []).map((b) => ({
    url: `${siteUrl}/beats/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...beatRoutes];
}