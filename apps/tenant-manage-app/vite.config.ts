import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/tenant-manage-app',

    define: {
      'process.env.VITE_TENANT_PREFIX': JSON.stringify(env.VITE_TENANT_PREFIX || ''),
    },

    server: {
      port: 7500,
      host: 'localhost',
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:7300',
          changeOrigin: true,
        },
      },
    },

    preview: {
      port: 7520,
      host: 'localhost',
    },

    plugins: [react(), nxViteTsPaths()],

    build: {
      outDir: '../../dist/apps/tenant-manage-app',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
