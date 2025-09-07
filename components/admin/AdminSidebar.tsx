"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState, createContext, useContext } from "react";

// Context để chia sẻ số lượt pending
interface PendingCountContextType {
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

const PendingCountContext = createContext<PendingCountContextType | undefined>(
  undefined,
);

export const usePendingCount = () => {
  const context = useContext(PendingCountContext);
  if (!context) {
    throw new Error("usePendingCount must be used within PendingCountProvider");
  }
  return context;
};

export const PendingCountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
    adminOnly: true,
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
  {
    title: "Báo cáo bàn giao",
    href: "/admin/handover-reports",
    icon: "📝",
  },
  {
    title: "Báo cáo kết ca",
    href: "/admin/reports",
    icon: "📝",
  },
  {
    title: "Quản lý Feedback",
    href: "/admin/feedback",
    icon: "💬",
    adminOnly: true,
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
  const [loginType, setLoginType] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState("GO_VAP");
  const [isClient, setIsClient] = useState(false);
  const { pendingCount, setPendingCount } = usePendingCount();

  // Set isClient to true after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cookies after mount
  useEffect(() => {
    const loginTypeFromCookie = Cookies.get("loginType");
    const branchFromCookie = Cookies.get("branch");

    setLoginType(loginTypeFromCookie);
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

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [branch]);

  // Không cần polling riêng - sẽ nhận data từ RewardExchangePage
  // Chỉ fetch một lần khi vào trang reward-exchange để có initial data
  useEffect(() => {
    const isRewardExchangePage = pathname === "/admin/reward-exchange";
    if (isRewardExchangePage && branch) {
      // Fetch một lần để có initial data
      fetch(
        `/api/reward-exchange/stats?branch=${branch}&startDate=${new Date().toISOString().split("T")[0]}&endDate=${new Date().toISOString().split("T")[0]}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setPendingCount(data.pending || 0);
        })
        .catch((err) => console.error("Error fetching initial stats:", err));
    }
  }, [pathname, branch]);

  // Reset pending count khi rời khỏi trang reward-exchange
  useEffect(() => {
    const isRewardExchangePage = pathname === "/admin/reward-exchange";
    if (!isRewardExchangePage && pendingCount > 0) {
      // Reset pending count khi không ở trang reward-exchange và có pending count
      setPendingCount(0);
    }
  }, [pathname, pendingCount]);

  // Filter menu items based on admin role
  const filteredMenuItems = menuItems.filter((item) => {
    // Nếu là admin (loginType === "username"), hiển thị tất cả menu
    if (loginType === "username") {
      return true;
    }

    // Nếu không phải admin (loginType === "mac"), chỉ hiển thị các menu được phép
    const allowedMenus = [
      "/admin", // Dashboard
      "/admin/reward-exchange", // Quản lý đổi thưởng
      "/admin/handover-reports", // Báo cáo bàn giao
      "/admin/reports", // Báo cáo kết ca
    ];

    return allowedMenus.includes(item.href);
  });

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <aside className="w-64 bg-gray-800 shadow-xl border-r border-gray-700">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-100">Admin Panel</h2>
        </div>
        <nav className="mt-4">{/* Show loading state or skeleton */}</nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-800 shadow-xl border-r border-gray-700">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-100">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        {filteredMenuItems.map((item) => {
          // Logic active menu:
          // - Dashboard (/admin): Chỉ active khi ở chính xác /admin
          // - Các trang khác: Active khi pathname bắt đầu bằng href
          // Ví dụ: /admin/gift-rounds sẽ active menu "Tặng lượt chơi"
          let isActive = false;

          if (item.href === "/admin") {
            // Dashboard chỉ active khi ở chính xác /admin
            isActive = pathname === "/admin";
          } else {
            // Các trang khác active khi pathname bắt đầu bằng href
            isActive = pathname?.startsWith(item.href) || false;
          }

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
