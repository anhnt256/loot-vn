import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, EyeOff, Eye } from 'lucide-react';
import { getBranchFromCookie } from '../lib/branch-cookie';
import { apiClient } from '@gateway-workspace/shared/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkedBranch, setCheckedBranch] = useState(false);
  const [tenantLogo, setTenantLogo] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const result = await apiClient.get('/auth/tenant-info');
        if (result.data?.success && result.data?.data) {
          const config = result.data.data;
          if (config.name) {
            document.title = config.name;
          }
          if (config.logo) {
            let logo = config.logo;
            if (typeof logo === 'object') {
              logo = logo?.url || null;
            }
            if (logo) {
              let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
              }
              link.href = logo;
            }
            setTenantLogo(logo);
          }
        }
      } catch (err) {
        console.error('Failed to fetch tenant info:', err);
      }
    };
    fetchTenantInfo();
  }, []);

  useEffect(() => {
    if (checkedBranch) return;
    const branch = getBranchFromCookie();
    if (!branch) {
      navigate('/branch-select', { replace: true });
      return;
    }
    setCheckedBranch(true);
  }, [navigate, checkedBranch]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      navigate('/branch-select');
    }
  };

  if (!checkedBranch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      {/* Container matching the dark card in the design */}
      <div className="w-full bg-[#1c232f] rounded-2xl p-8 shadow-xl border border-gray-800 flex flex-col items-center">
        
        {/* Logo area */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-600 p-1 mb-6 flex items-center justify-center relative shadow-[0_0_15px_rgba(246,106,18,0.5)]">
          {tenantLogo ? (
            <img src={tenantLogo} alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-orange-500 z-10 relative bg-black" />
          ) : (
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center border-2 border-orange-500 overflow-hidden relative">
              {/* Outer decorative ring */}
              <div className="absolute inset-2 border border-orange-500/50 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 border border-orange-500/30 rounded-full border-dotted animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Core golden spiral logo shape based on image */}
              <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] text-orange-400 absolute z-10">
                <path d="M50 10 A40 40 0 1 1 10 50 A30 30 0 1 0 50 20 A20 20 0 1 1 30 50 A10 10 0 1 0 50 40" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="3" fill="currentColor" />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-8 tracking-wide">
          HR Manager Portal
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 block">
              Tên tài khoản
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập" 
                className="w-full bg-[#151b22] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors placeholder:text-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 block">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu" 
                className="w-full bg-[#151b22] border border-gray-700 text-white rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors placeholder:text-gray-500 text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-[#e86014] hover:bg-[#ff7b2b] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center shadow-[0_0_10px_rgba(232,96,20,0.3)] hover:shadow-[0_0_15px_rgba(232,96,20,0.5)]"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <button
          type="button"
          onClick={() => navigate('/branch-select')}
          className="hover:text-gray-300 transition-colors underline"
        >
          Đổi chi nhánh
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        © 2026 HR Portal. All rights reserved.
      </div>
      </div>
    </div>
  );
}
