import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ExternalLink, AlertCircle, Building, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7300';

function getRootDomain(): string {
  const hostname =
    typeof globalThis.window === 'undefined'
      ? ''
      : globalThis.window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) return parts.slice(-2).join('.');
  return hostname || 'localhost';
}

export interface ClientApp {
  domain?: string;
  clientId?: string;
  portalId?: string;
  clientPrefix?: string;
  displayName?: string;
}

export interface TenantWithClients {
  id: string;
  name: string;
  domainPrefix?: string | null;
  clients: { list: ClientApp[] };
}

export interface OrgWithTenants {
  id: string;
  name: string;
  description?: string | null;
  rootDomain?: string | null;
  tenants: TenantWithClients[];
}

function tenantHasAccessibleApps(t: TenantWithClients): boolean {
  const list = t.clients?.list ?? [];
  return list.some((c) => (c.domain?.trim() ?? '').length > 0);
}

function getAccessibleApps(t: TenantWithClients): ClientApp[] {
  const list = t.clients?.list ?? [];
  return list.filter((c) => (c.domain?.trim() ?? '').length > 0);
}

export default function AppsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantIdFromUrl = searchParams.get('tenantId');

  const [org, setOrg] = useState<OrgWithTenants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchStarted = useRef(false);

  // Luôn gọi API khi mount (kể cả F5 hoặc vào từ trang chủ) để luôn có danh sách mới
  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    const rootDomain = getRootDomain();
    setLoading(true);
    setError(null);
    fetch(
      `${API_URL}/api/tenant-admin/org-management/organizations/by-domain?rootDomain=${encodeURIComponent(rootDomain)}`
    )
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404)
            throw new Error(`Không tìm thấy tổ chức cho domain: ${rootDomain}`);
          throw new Error(res.statusText || 'Lỗi khi tải thông tin tổ chức');
        }
        return res.json();
      })
      .then((data: OrgWithTenants) => {
        setOrg(data);
        const withApps = (data.tenants ?? []).filter(tenantHasAccessibleApps);
        if (!tenantIdFromUrl && withApps.length === 1) {
          setSearchParams({ tenantId: withApps[0].id }, { replace: true });
        }
      })
      .catch((e) => setError(e.message || 'Lỗi kết nối'))
      .finally(() => setLoading(false));
  }, [tenantIdFromUrl, setSearchParams]);

  const tenantsWithApps = (org?.tenants ?? []).filter(tenantHasAccessibleApps);
  const selectedTenantId =
    (tenantIdFromUrl && tenantsWithApps.some((t) => t.id === tenantIdFromUrl))
      ? tenantIdFromUrl
      : tenantsWithApps[0]?.id ?? null;
  const selectedTenant = tenantsWithApps.find((t) => t.id === selectedTenantId);
  const clientList = selectedTenant ? getAccessibleApps(selectedTenant) : [];

  const setTenantId = (id: string) => {
    setSearchParams({ tenantId: id }, { replace: true });
  };

  const openApp = (client: ClientApp) => {
    const domain = client.domain?.trim();
    if (!domain) return;
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    globalThis.window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151b22] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#151b22] flex items-center justify-center p-4">
        <div className="bg-[#1c232f] rounded-2xl p-8 shadow-xl border border-red-900/50 text-center max-w-md">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Không thể tải dữ liệu</h2>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="text-orange-500 hover:text-orange-400 text-sm"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!org) return null;

  const noSystemsWithApps = tenantsWithApps.length === 0;
  if (noSystemsWithApps) {
    return (
      <div className="min-h-screen bg-[#151b22] flex flex-col items-center justify-center p-4">
        <div className="bg-[#1c232f] rounded-2xl p-8 max-w-md text-center">
          <Building className="text-orange-500 mx-auto mb-4" size={40} />
          <h2 className="text-xl font-bold text-white mb-2">{org.name}</h2>
          <p className="text-gray-400 text-sm mb-4">
            Không có hệ thống nào có ứng dụng có thể truy cập.
          </p>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="text-orange-500 hover:text-orange-400 text-sm"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151b22] text-white flex flex-col">
      {/* Header: org name (left) | tenant combobox (right) */}
      <header className="flex items-center justify-between gap-4 px-4 py-4 border-b border-gray-800 bg-[#1c232f]/80 sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <Building className="text-orange-500 shrink-0" size={24} />
          <h1 className="text-lg font-bold text-white truncate">{org.name}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="tenant-select" className="text-sm text-gray-400 sr-only">
            Đổi chi nhánh
          </label>
          <select
            id="tenant-select"
            value={selectedTenantId ?? ''}
            onChange={(e) => setTenantId(e.target.value)}
            className="bg-[#151b22] border border-gray-700 text-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem' }}
          >
            {tenantsWithApps.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.domainPrefix ? ` (${t.domainPrefix})` : ''}
                {' · '}{getAccessibleApps(t).length} app
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* App cards grid */}
      <main className="flex-1 p-4 md:p-6">
        {!selectedTenantId ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            Chọn chi nhánh ở góc phải trên.
          </p>
        ) : clientList.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            Chưa có ứng dụng nào có thể truy cập cho chi nhánh này.
          </p>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {clientList.length} ứng dụng có thể sử dụng
            </p>
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientList.map((client, index) => {
                const label =
                  client.displayName ||
                  client.portalId ||
                  client.clientId ||
                  client.clientPrefix ||
                  client.domain ||
                  `App ${index + 1}`;
                const domain = client.domain?.trim() ?? '';
                return (
                  <motion.button
                    key={`${client.clientId}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    type="button"
                    onClick={() => openApp(client)}
                    className="rounded-xl border border-gray-700 p-5 text-left transition-all flex flex-col gap-3 bg-[#1c232f] hover:border-orange-500/50 hover:bg-orange-500/5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                        <ExternalLink size={24} className="text-gray-400" />
                      </div>
                      <ChevronRight size={18} className="text-gray-500 shrink-0" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-200 block truncate">
                        {label}
                      </span>
                      <span className="text-xs text-gray-500 font-mono truncate block mt-0.5">
                        {domain}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
