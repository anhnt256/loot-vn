"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/queries/auth.query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { setCookie } from "cookies-next";
import dayjs from "@/lib/dayjs";
import { Spin } from "antd";
import { UserIcon, WifiIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getMacAddresses } from "@/lib/mac";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

// MAC address to branch mapping with type safety
const ADMIN_MAC_MAPPING: Record<string, string> = {
  "00-25-D8-B9-27-0C": "GO_VAP",
  "D8-BB-C1-5D-0A-DD": "TAN_PHU",
} as const;

// Admin username from env
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;

const AdminLogin = () => {
  const [userName, setUsername] = useState<string>("");
  const [macAddress, setMacAddress] = useState<string>("");
  const [currentMacAddress, setCurrentMacAddress] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const loginMutation = useLogin();
  const router = useRouter();

  const handleLogin = useCallback(
    async (isAutoLogin: boolean = false) => {
      if (pageLoading) return;

      // Determine login case
      const hasMac = !!macAddress && macAddress.trim() !== "";
      const hasUsername = !!userName && userName.trim() !== "";
      // Check if username matches admin username (if ADMIN_USERNAME is set)
      const isAdminUsername = ADMIN_USERNAME ? userName === ADMIN_USERNAME : hasUsername;
      const isAdminDebugLogin = hasMac && hasUsername && isAdminUsername; // Case 3: Cả MAC + Username (admin)
      const isStaffMacLogin = hasMac && !hasUsername; // Case 1: Chỉ MAC
      const isAdminOnlyLogin = !hasMac && hasUsername && isAdminUsername; // Case 2: Chỉ Username (admin)

      // Validation
        if (isStaffMacLogin) {
          // Case 1: Chỉ MAC Address → nhân viên, cần check MAC
          // Get current MAC address
          try {
            const macAddresses = await getMacAddresses();
            const currentMac = macAddresses[0] || "";
            setCurrentMacAddress(currentMac);
            
            // Normalize MAC addresses for comparison (remove colons/dashes, uppercase)
            const normalizeMac = (mac: string) => {
              return mac.replace(/[:-]/g, "").toUpperCase();
            };
            
            const normalizedInput = normalizeMac(macAddress);
            const normalizedCurrent = normalizeMac(currentMac);
            
            if (normalizedInput !== normalizedCurrent) {
              toast.error("MAC address không khớp với MAC address hiện tại của máy!");
              return;
            }
          } catch (error) {
            console.error("Error getting MAC address:", error);
            toast.error("Không thể lấy MAC address hiện tại. Vui lòng thử lại.");
            return;
          }
          
          if (!isAutoLogin && !ADMIN_MAC_MAPPING[macAddress]) {
            toast.error("MAC address không được nhận diện!");
            return;
          }
        } else if (isAdminDebugLogin) {
          // Case 3: Cả MAC + Username (admin) → admin debug với tài khoản nhân viên, bypass MAC check
          try {
            const macAddresses = await getMacAddresses();
            const currentMac = macAddresses[0] || "";
            setCurrentMacAddress(currentMac);
          } catch (error) {
            console.error("Error getting MAC address:", error);
            // Don't block login for admin debug
          }
        } else if (isAdminOnlyLogin) {
          // Case 2: Chỉ Username (admin) - không cần check MAC, không cần MAC address
          // No validation needed, will be handled in API
        } else if (hasUsername && !isAdminUsername) {
          // Username không phải admin username
        toast.error(`Tên đăng nhập không hợp lệ. Vui lòng sử dụng trang đăng nhập nhân viên.`);
          return;
        } else {
          toast.error("Vui lòng nhập MAC address hoặc Username!");
          return;
      }

      setPageLoading(true);
      try {
        // Determine login case again for cookie setting
        const hasMac = !!macAddress && macAddress.trim() !== "";
        const hasUsername = !!userName && userName.trim() !== "";
        const isAdminUsername = ADMIN_USERNAME ? userName === ADMIN_USERNAME : hasUsername;
        const isAdminDebugLogin = hasMac && hasUsername && isAdminUsername; // Case 3
        const isStaffMacLogin = hasMac && !hasUsername; // Case 1
        const isAdminOnlyLogin = !hasMac && hasUsername && isAdminUsername; // Case 2

        // Set cookies based on login case
          if (isStaffMacLogin || isAdminDebugLogin) {
            // Case 1 và Case 3: đều dùng loginType = "mac" để giữ quyền nhân viên
            if (macAddress && ADMIN_MAC_MAPPING[macAddress]) {
              setCookie("branch", ADMIN_MAC_MAPPING[macAddress], {
                path: "/",
                expires: new Date(expirationDate),
              });
            }
            setCookie("loginType", "mac", {
              path: "/",
              expires: new Date(expirationDate),
            });
          } else if (isAdminOnlyLogin) {
            // Case 2: Chỉ Username (admin)
            setCookie("branch", "GO_VAP", {
              path: "/",
              expires: new Date(expirationDate),
            });
            setCookie("loginType", "username", {
            path: "/",
            expires: new Date(expirationDate),
          });
        }

        const result = await loginMutation.mutateAsync({
          userName: isAutoLogin ? (ADMIN_USERNAME || "") : (userName || ""),
          isAdmin: true,
          loginMethod: "mac",
          macAddress: macAddress || undefined,
          currentMacAddress: currentMacAddress || undefined,
        });

        const { statusCode, message } = result || {};

        if (statusCode === 200) {
          toast.success("Chào mừng đến với The GateWay!");
          router.push("/admin");
        } else if (statusCode === 500 || statusCode === 499 || statusCode === 401) {
          toast.error(message || "Đăng nhập thất bại");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Đã có lỗi xảy ra khi đăng nhập");
      }
      setPageLoading(false);
    },
    [pageLoading, userName, macAddress, currentMacAddress, loginMutation, router],
  );

  if (pageLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Spin size="large" tip="Loading..." spinning={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 backdrop-blur-sm bg-black/30 border-gray-800">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-24 h-24">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-gray-400 text-sm">
                Please sign in to continue
              </p>
            </div>

            <div className="w-full space-y-4">
              {/* MAC Address Login */}
                <div className="space-y-2">
                  <Label
                    htmlFor="macAddress"
                    className="text-sm font-medium text-gray-200"
                  >
                    MAC Address
                  </Label>
                  <div className="relative">
                    <WifiIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      id="macAddress"
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      placeholder="Enter MAC address"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLogin(false);
                        }
                      }}
                    />
                </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-200"
                    >
                      Username (Admin) - Optional
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        id="username"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username (optional)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleLogin(false);
                          }
                        }}
                      />
                    </div>
                  </div>

              {/* Sign In Button */}
              <Button
                onClick={() => handleLogin(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
