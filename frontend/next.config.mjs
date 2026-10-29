/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // AI routes retry and fall back between Gemini models, which can exceed the 30s default
    proxyTimeout: 120_000,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    const authUrl = (process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
    const userUrl = (process.env.NEXT_PUBLIC_USER_URL || "http://localhost:3002").replace(/\/+$/, "");
    const jobUrl = (process.env.NEXT_PUBLIC_JOB_URL || "http://localhost:3003").replace(/\/+$/, "");
    const utilsUrl = (process.env.NEXT_PUBLIC_UTILS_URL || "http://localhost:3001").replace(/\/+$/, "");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${authUrl}/api/auth/:path*`,
      },
      {
        source: "/api/user/:path*",
        destination: `${userUrl}/api/user/:path*`,
      },
      {
        source: "/api/job/:path*",
        destination: `${jobUrl}/api/job/:path*`,
      },
      {
        source: "/api/utils/:path*",
        destination: `${utilsUrl}/api/utils/:path*`,
      },
    ];
  },
};

export default nextConfig;
