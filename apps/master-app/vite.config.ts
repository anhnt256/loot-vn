import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  // process.env so Docker build args (ARG/ENV VITE_*) are used when .env is not present
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || '';
  const tenantPrefix = process.env.VITE_TENANT_PREFIX || env.VITE_TENANT_PREFIX || '';
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/master-app',

    define: {
      'import.meta.env.VITE_TENANT_PREFIX': JSON.stringify(tenantPrefix),
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_API_URL': JSON.stringify(apiUrl),
      'process.env.VITE_GATEWAY_GO_VAP_SECRET_KEY': JSON.stringify(process.env.VITE_GATEWAY_GO_VAP_SECRET_KEY || env.VITE_GATEWAY_GO_VAP_SECRET_KEY || ''),
      'process.env.VITE_GATEWAY_TAN_PHU_SECRET_KEY': JSON.stringify(process.env.VITE_GATEWAY_TAN_PHU_SECRET_KEY || env.VITE_GATEWAY_TAN_PHU_SECRET_KEY || ''),
      'process.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET || env.JWT_SECRET || ''),
    },

    server: {
      port: 7700,
    },

    preview: {
      port: 7720,
    },

    plugins: [react(), nxViteTsPaths()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
