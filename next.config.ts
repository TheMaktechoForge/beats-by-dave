import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  async redirects() {
    return [
      // Beat slug renames — 301 to the new canonical slug.
      // Added 2026-07-15: removed "Pimp C Type Beat" label, repackaged "Southern Dog" series.
      {
        source: "/beats/pimp-c-type-beat-having-thangs",
        destination: "/beats/having-thangs",
        permanent: true,
      },
      {
        source: "/beats/southland-2",
        destination: "/beats/southern-dog-2-trap-or-die",
        permanent: true,
      },
      {
        source: "/beats/southern-dog-17-trap-or-death",
        destination: "/beats/southern-dog-1-trap-life",
        permanent: true,
      },
      {
        source: "/beats/southern-boy-4-trap-god",
        destination: "/beats/southern-dog-4-trap-god",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;