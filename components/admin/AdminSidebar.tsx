"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState, createContext, useContext, useRef } from "react";
import { usePolling } from "@/hooks/usePolling";
import { useSoundNotification } from "@/hooks/useSoundNotification";
import { getCurrentDateVNString } from "@/lib/timezone-utils";

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
    title: "Đơn hàng Premium BP",
    href: "/admin/battle-pass-orders",
    icon: "🛒",
    adminOnly: true,
    showBattlePassOrderCount: true,
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
    title: "Cảnh báo bất thường",
    href: "/admin/anomaly",
    icon: "⚠️",
  },
  {
    title: "Cảnh báo gian lận đăng nhập",
    href: "/admin/fraud-alerts",
    icon: "🔐",
    adminOnly: true,
  },
  {
    title: "Quản lý Feedback",
    href: "/admin/feedback",
    icon: "💬",
    adminOnly: true,
  },
  {
    title: "Quản lý hẹn chơi",
    href: "/admin/game-appointments",
    icon: "🎮",
    adminOnly: true,
  },
  {
    title: "Quản lý Event",
    href: "/admin/events",
    icon: "🎪",
    adminOnly: true,
  },
  {
    title: "Lịch làm việc",
    href: "/admin/work-schedule",
    icon: "📅",
  },
  {
    title: "Quản lý ca làm việc",
    href: "/admin/work-shifts",
    icon: "⏰",
    adminOnly: true,
  },
  {
    title: "Quản lý nhân viên",
    href: "/admin/staff",
    icon: "👥",
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
  const previousPendingCount = useRef(0);
  const [battlePassOrderCount, setBattlePassOrderCount] = useState(0);
  const previousBattlePassOrderCount = useRef(0);
  const { playNotification, playSound } = useSoundNotification();

  // Set isClient to true after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cookies after mount
  useEffect(() => {
    const loginTypeFromCookie = Cookies.get("loginType");
    const branchFromCookie = Cookies.get("branch");

    setLoginType(loginTypeFromCookie);
    if (branchFromCookie) {
      setBranch(branchFromCookie);
      // Reset previous count khi branch thay đổi
      previousPendingCount.current = 0;
      previousBattlePassOrderCount.current = 0;
    }
  }, []);

  // Listen for branch cookie changes
  useEffect(() => {
    const handleStorageChange = () => {
      const branchFromCookie = Cookies.get("branch");
      if (branchFromCookie && branchFromCookie !== branch) {
        setBranch(branchFromCookie);
        // Reset previous count khi branch thay đổi
        previousPendingCount.current = 0;
        previousBattlePassOrderCount.current = 0;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [branch]);

  // Tạo URL cố định để tránh re-render với timezone Vietnam
  const today = getCurrentDateVNString();
  const statsUrl = `/api/reward-exchange/stats?branch=${branch}&startDate=${today}&endDate=${today}`;

  // Global polling cho stats - chỉ chạy khi KHÔNG ở trang reward-exchange
  const isRewardExchangePage = pathname === "/admin/reward-exchange";
  const shouldPollStats =
    !!branch && pathname?.startsWith("/admin") && !isRewardExchangePage;

  const statsPolling = usePolling<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }>(statsUrl, {
    interval: 30000, // 30 seconds - nhanh hơn để user nhận thấy ngay
    enabled: shouldPollStats, // Chỉ chạy khi ở trang admin NHƯNG KHÔNG phải reward-exchange
    onSuccess: (data) => {
      const newPendingCount = data.pending || 0;

      // Phát âm thanh khi có pending mới
      playNotification(newPendingCount, previousPendingCount.current);

      // Cập nhật pending count
      setPendingCount(newPendingCount);
      previousPendingCount.current = newPendingCount;
    },
    onError: (error) => {
      console.error("AdminSidebar polling error:", error);
    },
  });

  // Polling for battle-pass orders count
  const isBattlePassOrdersPage = pathname === "/admin/battle-pass-orders";
  const shouldPollBattlePassOrders =
    !!branch && pathname?.startsWith("/admin") && !isBattlePassOrdersPage;

  const battlePassOrdersPolling = usePolling<any[]>(
    `/api/battle-pass/orders?status=PENDING`,
    {
      interval: 30000, // 30 seconds
      enabled: shouldPollBattlePassOrders,
      onSuccess: (data) => {
        const newCount = data?.length || 0;

        // Phát âm thanh khi có order mới
        playNotification(newCount, previousBattlePassOrderCount.current);

        setBattlePassOrderCount(newCount);
        previousBattlePassOrderCount.current = newCount;
      },
      onError: (error) => {
        console.error("BattlePass orders polling error:", error);
      },
    },
  );

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
      "/admin/battle-pass-orders", // Đơn hàng Premium BP
      "/admin/handover-reports", // Báo cáo bàn giao
      "/admin/reports", // Báo cáo kết ca
      "/admin/anomaly", // Cảnh báo bất thường
      "/admin/work-schedule", // Lịch làm việc
      "/admin/work-shifts", // Quản lý ca làm việc
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
              {item.showBattlePassOrderCount && battlePassOrderCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {battlePassOrderCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
