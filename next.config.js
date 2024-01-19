/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: false,
  reactStrictMode: true,
  headers: () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
