import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import {
  AdminSidebar,
  PendingCountProvider,
} from "@gateway-workspace/shared/ui";
import { AdminHeader } from "@gateway-workspace/shared/ui";
import { StaffProvider } from "@gateway-workspace/shared/ui";
import { BranchProvider } from "@gateway-workspace/shared/ui";
import { AdminChatProvider, AdminChatButton } from "@gateway-workspace/shared/ui";

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
    <BranchProvider>
      <PendingCountProvider>
        <StaffProvider>
          <AdminChatProvider>
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

              {/* Admin Chat Button */}
              <AdminChatButton />
            </div>
          </AdminChatProvider>
        </StaffProvider>
      </PendingCountProvider>
    </BranchProvider>
  );
}
