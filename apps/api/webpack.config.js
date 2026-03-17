const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { join } = require('path');

const prismaGenerated = join(__dirname, '../../libs/database/src/lib/generated');
const prismaEngineName = 'libquery_engine-debian-openssl-3.0.x.so.node';

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  ignoreWarnings: [/Failed to parse source map/],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
      memoryLimit: 8192,
    }),
    // Copy Prisma Query Engine for Linux so runtime finds it next to the bundle
    new CopyPlugin({
      patterns: [
        {
          from: prismaEngineName,
          context: join(prismaGenerated, 'prisma-client'),
          to: prismaEngineName,
          noErrorOnMissing: true,
        },
        {
          from: prismaEngineName,
          context: join(prismaGenerated, 'tenant-client'),
          to: prismaEngineName,
          noErrorOnMissing: true,
        },
        {
          from: prismaEngineName,
          context: join(prismaGenerated, 'fnet-client'),
          to: prismaEngineName,
          noErrorOnMissing: true,
        },
      ].filter(Boolean),
    }),
  ],
  externals: [
    function ({ context, request }, callback) {
      if (request && request.startsWith('@gateway-workspace/')) {
        // Bundle our workspace libraries instead of ignoring them
        return callback();
      }
      // Let Nx handle the rest
      callback(null, undefined);
    },
  ],
};
