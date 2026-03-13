import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict type checking and linting in production builds
  // This catches security issues before deployment
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Security: Disable x-powered-by header
  poweredByHeader: false,

  // Security: Configure allowed image domains if using next/image
  images: {
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Override Next.js Vary header on API routes so Cloudflare CDN caches them.
  // Next.js adds Vary: rsc, next-router-state-tree, etc. which causes
  // Cloudflare to skip caching (only Accept-Encoding is supported).
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
    ];
  },
};

export default nextConfig;
