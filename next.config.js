/** @type {import('next').NextConfig} */

const Timestamp = new Date().getTime();
const CopyPlugin = require("copy-webpack-plugin");

const nextConfig = {
  compress: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  swcMinify: true,
  headers: () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "force-no-store",
        },
      ],
    },
  ],
  webpack(config, { isServer }) {
    if (!isServer) {
      // Modifying the output filename for client-side bundles
      config.output.filename = `static/chunks/[name].${Timestamp}.js`;
      config.output.chunkFilename = `static/chunks/[name].${Timestamp}.js`;
    } else {
      config.externals = [
        ...config.externals,
        require("webpack-node-externals")(),
      ];
    }
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "./node_modules/.prisma/client/schema.prisma",
            to: "./prisma/generated/prisma-client",
          },
          {
            from: "./node_modules/.prisma/client/schema.prisma",
            to: "./prisma/generated/fnet-gv-client",
          },
        ],
      }),
    );
    return config;
  },
  experimental: {
    outputFileTracingIncludes: {
      "*": [
        "node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node",
      ],
    },
    serverActions: true,
  },
};

module.exports = nextConfig;
