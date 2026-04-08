import * as ReactDOM from 'react-dom/client';

import App from './app/App';

import './index.css';
import { apiClient, removeToken } from '@gateway-workspace/shared/utils/client';

// Redirect to login on 401 (expired/invalid token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 503 &&
      !window.location.pathname.includes('/maintenance')
    ) {
      window.location.href = '/maintenance';
      return Promise.reject(error);
    }
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/') &&
      !window.location.pathname.includes('/login')
    ) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

async function bootstrap() {
  if (typeof globalThis.window !== 'undefined') {
    const host = globalThis.window.location.hostname;
    const firstSegment = host.split('.')[0] ?? '';
    const slug = firstSegment.startsWith('client-')
      ? firstSegment.slice('client-'.length)
      : (import.meta.env.VITE_TENANT_PREFIX || '').replace(/-$/, '');
    if (slug) {
      apiClient.defaults.headers.common['x-tenant-id'] = slug;
      try {
        const res = await apiClient.get('/auth/tenant-info');
        if (res.data?.success && res.data?.data) {
          const config = res.data.data;
          if (config.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', config.primaryColor);
          }
          if (config.secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
          }
          if (config.name) {
            document.title = config.name;
          }
          if (config.logo) {
            const logoUrl = typeof config.logo === 'string' ? config.logo : config.logo.url;
            if (logoUrl) {
              let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
              }
              link.href = logoUrl;
            }
          }
          (window as any).__TENANT_CONFIG__ = config;
        }
      } catch (err) {
        console.error('Failed to load tenant config during init', err);
      }
    }
  }

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(<App />);
}

bootstrap();
