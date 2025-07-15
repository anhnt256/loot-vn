import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import {
  AdminSidebar,
  PendingCountProvider,
} from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the application",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PendingCountProvider>
      <div className="flex h-screen bg-gray-900">
        <Toaster richColors position="top-right" />
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
            {children}
          </main>
        </div>
      </div>
    </PendingCountProvider>
  );
}
