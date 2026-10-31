/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Resume analysis may try more than one Gemini model before returning.
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
  // Render Blueprint references provide private host:port values. Next rewrites
  // and the server-side API client need an explicit protocol.
  async rewrites() {
    const serviceOrigin = (value, defaultPort) => {
      const raw = (value || `localhost:${defaultPort}`).replace(/\/+$/, "");
      return /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
    };
    const authUrl = serviceOrigin(process.env.AUTH_SERVICE_URL || process.env.NEXT_PUBLIC_AUTH_URL, 3000);
    const userUrl = serviceOrigin(process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_URL, 3002);
    const jobUrl = serviceOrigin(process.env.JOB_SERVICE_URL || process.env.NEXT_PUBLIC_JOB_URL, 3003);
    const utilsUrl = serviceOrigin(process.env.UTILS_SERVICE_URL || process.env.NEXT_PUBLIC_UTILS_URL, 3001);

    return [
      { source: "/api/auth/:path*", destination: `${authUrl}/api/auth/:path*` },
      { source: "/api/user/:path*", destination: `${userUrl}/api/user/:path*` },
      { source: "/api/job/:path*", destination: `${jobUrl}/api/job/:path*` },
      { source: "/api/utils/:path*", destination: `${utilsUrl}/api/utils/:path*` },
    ];
  },
};

export default nextConfig;
