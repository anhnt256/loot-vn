import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '';

function getRootDomain(): string {
  const hostname =
    typeof globalThis.window === 'undefined'
      ? ''
      : globalThis.window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts.slice(-2).join('.');
  }
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

/** Tenant có ít nhất 1 app có domain (có thể truy cập) */
function tenantHasAccessibleApps(t: TenantWithClients): boolean {
  const list = t.clients?.list ?? [];
  return list.some((c) => (c.domain?.trim() ?? '').length > 0);
}

/** Số app có thể sử dụng (có domain) của tenant */
function countAccessibleApps(t: TenantWithClients): number {
  const list = t.clients?.list ?? [];
  return list.filter((c) => (c.domain?.trim() ?? '').length > 0).length;
}

export default function MasterHomePage() {
  const [org, setOrg] = useState<OrgWithTenants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    const rootDomain = getRootDomain();
    setLoading(true);
    setError(null);
    fetch(
      `${API_URL}/api/tenant-admin/org-management/organizations/by-domain?rootDomain=${encodeURIComponent(rootDomain)}`,
    )
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Không tìm thấy tổ chức cho domain: ${rootDomain}`);
          }
          throw new Error(res.statusText || 'Lỗi khi tải thông tin tổ chức');
        }
        return res.json();
      })
      .then((data: OrgWithTenants) => setOrg(data))
      .catch((e) => setError(e.message || 'Lỗi kết nối'))
      .finally(() => setLoading(false));
  }, []);

  const navigate = useNavigate();

  const goToApps = (tenantId: string) => {
    navigate(`/apps?tenantId=${encodeURIComponent(tenantId)}`, {
      state: { org },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-400 text-sm">
          Đang tải thông tin tổ chức...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <div className="w-full bg-[#1c232f] rounded-2xl p-8 shadow-xl border border-red-900/50 flex flex-col items-center text-center">
          <AlertCircle className="text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">
            Không thể tải dữ liệu
          </h2>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-2">
            Root domain: {getRootDomain()}
          </p>
        </div>
        </div>
      </div>
    );
  }

  if (!org) return null;

  const tenantsWithApps = (org.tenants ?? []).filter(tenantHasAccessibleApps);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[#1c232f] rounded-2xl p-8 shadow-xl border border-gray-800 flex flex-col"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <Building className="text-orange-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {org.name}
          </h1>
          {org.description && (
            <p className="text-gray-400 mt-1 text-sm">{org.description}</p>
          )}
        </div>

        {/* Chỉ hiển thị hệ thống có ít nhất 1 app truy cập được */}
        <div
          className="mt-2"
          role="group"
          aria-labelledby="tenant-select-label"
        >
          <p
            id="tenant-select-label"
            className="block text-sm font-medium text-gray-300 mb-3"
          >
            Chọn hệ thống (tenant)
          </p>
          {tenantsWithApps.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Không có hệ thống nào có ứng dụng có thể truy cập.
            </p>
          ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {tenantsWithApps.map((t) => {
              const appCount = countAccessibleApps(t);
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  onClick={() => goToApps(t.id)}
                  className="w-full text-left rounded-xl border border-gray-700 p-4 transition-all flex items-center justify-between bg-[#151b22] hover:border-orange-500/50 hover:bg-orange-500/5"
                >
                  <span className="font-medium text-gray-200">
                    {t.name}
                    <span className="text-gray-400 font-normal ml-1.5">
                      ({appCount} {appCount === 1 ? 'app' : 'apps'})
                    </span>
                  </span>
                  <ChevronRight size={20} className="text-gray-500 shrink-0" />
                </motion.button>
              );
            })}
          </div>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
}
