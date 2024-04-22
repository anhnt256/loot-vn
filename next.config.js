/** @type {import('next').NextConfig} */

const Timestamp = new Date().getTime();

const nextConfig = {
  compress: false,
  reactStrictMode: true,
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
    }

    // For CSS files, if you're using CSS modules
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: "css-loader",
          options: {
            modules: {
              getLocalIdent: (context, localIdentName, localName) => {
                return `${localName}_${Timestamp}`;
              },
            },
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
