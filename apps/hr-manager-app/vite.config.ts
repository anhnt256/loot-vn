import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/hr-manager-app',

    define: {
      'process.env.VITE_TENANT_PREFIX': JSON.stringify(env.VITE_TENANT_PREFIX || ''),
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
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
      outDir: '../../dist/apps/hr-manager-app',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
