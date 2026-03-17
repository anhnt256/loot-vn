import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { apiClient } from '@gateway-workspace/shared/utils';

// Bind x-tenant-id from hostname (e.g. hr-gateway-go-vap.loot.vn -> gateway-go-vap) or env
if (typeof globalThis.window !== 'undefined') {
  const host = globalThis.window.location.hostname;
  const firstSegment = host.split('.')[0] ?? '';
  const slug = firstSegment.startsWith('hr-')
    ? firstSegment.slice(3)
    : (import.meta.env.VITE_TENANT_PREFIX || '').replace(/-$/, '');
  if (slug) apiClient.defaults.headers.common['x-tenant-id'] = slug;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
