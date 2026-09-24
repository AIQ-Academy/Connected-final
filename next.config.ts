import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles in parent dirs.
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/accounts.html", destination: "/accounts", permanent: true },
      { source: "/platforms.html", destination: "/platforms", permanent: true },
      { source: "/education.html", destination: "/glossary", permanent: true },
      { source: "/education", destination: "/glossary", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      // Funded marketing is hidden from the public site.
      { source: "/funded", destination: "/trading", permanent: false },
      {
        source: "/funded/coming-soon",
        destination: "/trading",
        permanent: false,
      },
      // Live trading product moved from /broker → /trading (product key stays "broker").
      { source: "/broker", destination: "/trading", permanent: true },
      {
        source: "/broker/coming-soon",
        destination: "/trading/coming-soon",
        permanent: true,
      },
      {
        source: "/broker/:path*",
        destination: "/trading/:path*",
        permanent: true,
      },
      {
        source: "/register",
        destination:
          "https://portal.bbcorp.trade/auth/jwt/sign-up/b/72nzf8/prod/BPOM9S",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
