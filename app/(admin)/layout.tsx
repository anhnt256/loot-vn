"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { useActivityMonitor } from "@/hooks/use-activity-monitor";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add activity monitoring
  useEffect(() => {
    console.log('Admin layout mounted');
    useActivityMonitor();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
} 