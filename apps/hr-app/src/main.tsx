import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { apiClient } from '@gateway-workspace/shared/utils';

async function bootstrap() {
  if (typeof globalThis.window !== 'undefined') {
    const host = globalThis.window.location.hostname;
    const firstSegment = host.split('.')[0] ?? '';
    const slug = firstSegment.startsWith('hr-')
      ? firstSegment.slice(3)
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
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
