"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { usePolling } from "@/hooks/usePolling";
import { useEffect, useState, createContext, useContext } from "react";

// Context để chia sẻ số lượt pending
interface PendingCountContextType {
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

const PendingCountContext = createContext<PendingCountContextType | undefined>(undefined);

export const usePendingCount = () => {
  const context = useContext(PendingCountContext);
  if (!context) {
    throw new Error("usePendingCount must be used within PendingCountProvider");
  }
  return context;
};

export const PendingCountProvider = ({ children }: { children: React.ReactNode }) => {
  const [pendingCount, setPendingCount] = useState(0);
  
  return (
    <PendingCountContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </PendingCountContext.Provider>
  );
};

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  // {
  //   title: "Quản lý người dùng",
  //   href: "/admin/users",
  //   icon: "👥",
  // },
  {
    title: "Tặng lượt chơi",
    href: "/admin/gift-rounds",
    icon: "🎮",
  },
  {
    title: "Quản lý Battle Pass",
    href: "/admin/battle-pass-seasons",
    icon: "🎫",
    adminOnly: true,
  },
  {
    title: "Quản lý Premium Battle Pass",
    href: "/admin/battle-pass-premium-packages",
    icon: "💎",
    adminOnly: true,
  },
  {
    title: "Quản lý đổi thưởng",
    href: "/admin/reward-exchange",
    icon: "🎁",
    showPendingCount: true,
  },
  // {
  //   title: "Lịch sử giao dịch",
  //   href: "/admin/transactions",
  //   icon: "📝",
  // },
  // {
  //   title: "Cài đặt",
  //   href: "/admin/settings",
  //   icon: "⚙️",
  // },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const loginType = Cookies.get("loginType");
  const [branch, setBranch] = useState("GO_VAP");
  const { pendingCount, setPendingCount } = usePendingCount();

  // Load branch from cookie
  useEffect(() => {
    const branchFromCookie = Cookies.get("branch");
    if (branchFromCookie) setBranch(branchFromCookie);
  }, []);

  // Listen for branch cookie changes
  useEffect(() => {
    const handleStorageChange = () => {
      const branchFromCookie = Cookies.get("branch");
      if (branchFromCookie && branchFromCookie !== branch) {
        setBranch(branchFromCookie);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [branch]);

  // Polling for pending rewards count
  const pendingCountPolling = usePolling<{ pending: number }>(`/api/reward-exchange/stats?branch=${branch}&startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`, {
    interval: 60000, // 60 seconds
    enabled: true,
    onSuccess: (data) => {
      setPendingCount(data.pending || 0);
    },
  });

  // Filter menu items based on login type and admin role
  const filteredMenuItems = menuItems.filter((item) => {
    // If login type is macAddress, only show dashboard and reward exchange
    if (loginType === "macAddress") {
      return item.href === "/admin" || item.href === "/admin/reward-exchange";
    }

    // For other login types, show all items except adminOnly items for non-admin users
    // You can add additional logic here if needed
    return true;
  });

  return (
    <aside className="w-64 bg-gray-800 shadow-xl border-r border-gray-700">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-100">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
                isActive ? "bg-gray-700 text-white" : ""
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </div>
              {item.showPendingCount && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
