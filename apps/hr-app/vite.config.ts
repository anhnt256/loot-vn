import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/hr-app',

    define: {
      'process.env.VITE_TENANT_PREFIX': JSON.stringify(env.VITE_TENANT_PREFIX || ''),
    },

    server: {
      port: 7600,
      host: 'localhost',
    },

    preview: {
      port: 7620,
      host: 'localhost',
    },

    plugins: [react(), nxViteTsPaths()],

    build: {
      outDir: '../../dist/apps/hr',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
