import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
    // Unoptimized images for Cloudflare Pages compatibility
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Optimize for production
  reactStrictMode: true,
  // Disable powered by header
  poweredByHeader: false,
};

export default nextConfig;
