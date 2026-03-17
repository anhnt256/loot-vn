import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || '';
  const tenantPrefix = process.env.VITE_TENANT_PREFIX || env.VITE_TENANT_PREFIX || '';
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/hr-manager-app',

    define: {
      'process.env.VITE_TENANT_PREFIX': JSON.stringify(tenantPrefix),
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'process.env.VITE_API_URL': JSON.stringify(apiUrl),
    },

    server: {
      port: 7400,
      host: 'localhost',
    },

    preview: {
      port: 7420,
      host: 'localhost',
    },

    plugins: [react(), nxViteTsPaths()],

    build: {
      outDir: '../../dist/apps/hr-manager',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
