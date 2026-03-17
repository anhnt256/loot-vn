import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/master-app',

    define: {
      'import.meta.env.VITE_TENANT_PREFIX': JSON.stringify(env.VITE_TENANT_PREFIX || ''),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
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
