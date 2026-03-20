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
          const { primaryColor } = res.data.data;
          if (primaryColor) {
            document.documentElement.style.setProperty('--primary-color', primaryColor);
          }
          (window as any).__TENANT_CONFIG__ = res.data.data;
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
