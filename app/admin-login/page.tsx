"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

// MAC address to branch mapping with type safety
const ADMIN_MAC_MAPPING: Record<string, string> = {
  "00-25-D8-B9-27-0C": "GO_VAP",
  "D8-BB-C1-5D-0A-DD": "TAN_PHU",
} as const;

const BRANCHES = {
  GO_VAP: "Gò Vấp",
  TAN_PHU: "Tân Phú",
} as const;

const AdminLogin = () => {
  const [userName, setUsername] = useState<string>("");
  const [macAddress, setMacAddress] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const loginMutation = useLogin();
  const router = useRouter();

  const handleLogin = useCallback(
    async (isAutoLogin: boolean = false) => {
      if (pageLoading) return;

      // For auto-login, we don't need to check username
      if (
        !isAutoLogin &&
        userName !== "gateway_admin" &&
        !ADMIN_MAC_MAPPING[macAddress]
      ) {
        toast.error("Bạn không có quyền truy cập trang này!");
        return;
      }

      setPageLoading(true);
      try {
        // Set branch based on MAC address if available
        if (macAddress && ADMIN_MAC_MAPPING[macAddress]) {
          setCookie("branch", ADMIN_MAC_MAPPING[macAddress], {
            path: "/",
            expires: new Date(expirationDate),
          });
          setCookie("loginType", "mac", {
            path: "/",
            expires: new Date(expirationDate),
          });
        } else {
          setCookie("loginType", "username", {
            path: "/",
            expires: new Date(expirationDate),
          });
        }

        const result = await loginMutation.mutateAsync({
          userName: isAutoLogin ? "gateway_admin" : userName,
          isAdmin: true,
        });

        const { statusCode, message } = result || {};

        if (statusCode === 200) {
          toast.success("Chào mừng đến với The GateWay!");
          router.push("/admin");
        } else if (statusCode === 500 || statusCode === 499) {
          toast.error(message);
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Đã có lỗi xảy ra khi đăng nhập");
      }
      setPageLoading(false);
    },
    [pageLoading, userName, macAddress, loginMutation, router],
  );

  // Auto-login when valid MAC address is entered
  useEffect(() => {
    if (macAddress && ADMIN_MAC_MAPPING[macAddress]) {
      setSelectedBranch(ADMIN_MAC_MAPPING[macAddress]);
      handleLogin(true);
    }
  }, [macAddress]); // Remove handleLogin from dependencies

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
                  />
                </div>
                {!ADMIN_MAC_MAPPING[macAddress] && (
                  <p className="text-xs text-orange-400 mt-1">
                    MAC address not recognized. Please enter username to login.
                  </p>
                )}
              </div>

              {!ADMIN_MAC_MAPPING[macAddress] && (
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-200"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      id="username"
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                      value={userName}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                </div>
              )}

              {!ADMIN_MAC_MAPPING[macAddress] && (
                <Button
                  onClick={() => handleLogin(false)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                  size="lg"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
