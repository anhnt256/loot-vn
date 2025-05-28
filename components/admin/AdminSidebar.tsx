"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: "👥",
  },
  {
    title: "Tặng lượt chơi",
    href: "/admin/gift-rounds",
    icon: "🎮",
  },
  {
    title: "Lịch sử giao dịch",
    href: "/admin/transactions",
    icon: "📝",
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: "⚙️",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 shadow-xl border-r border-gray-700">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-100">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
                isActive ? "bg-gray-700 text-white" : ""
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 