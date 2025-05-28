"use client";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/queries/auth.query";
import { useAction } from "@/hooks/use-action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createUser } from "@/actions/create-user";
import { getCookie, setCookie } from "cookies-next";
import dayjs from "dayjs";
import { BRANCH } from "@/constants/enum.constant";
import { Spin } from "antd";
import { isElectron } from "@/lib/electron";
import { getMacAddresses } from "@/lib/mac";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

// Kiểm tra biến môi trường, mặc định là true nếu không được set
const ENABLE_MAC_CHECK = process.env.NEXT_PUBLIC_ENABLE_MAC_CHECK !== "false";

// MAC address to branch mapping with type safety
const MAC_BRANCH_MAPPING: Record<string, string> = {
  "00-25-D8-B9-27-0C": "GO_VAP",
  "D8-BB-C1-5D-0A-DD": "TAN_PHU"
} as const;

// Type guard for MAC addresses
const isKnownMacAddress = (mac: string): mac is keyof typeof MAC_BRANCH_MAPPING => {
  return mac in MAC_BRANCH_MAPPING;
};

const Login = () => {
  const [userName, setUsername] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState(true);
  const loginMutation = useLogin();
  const router = useRouter();

  const [macAddresses, setMacAddresses] = useState<string>();
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  const { data: machineData } = useQuery({
    queryKey: ["check-branch", macAddresses],
    enabled: ENABLE_MAC_CHECK && !!macAddresses,
    queryFn: () => {
      console.log("Fetching with macAddress:", macAddresses);
      return fetch("/api/check-branch").then((res) => res.json());
    },
  });

  useEffect(() => {
    let mounted = true;

    const checkPlatform = async () => {
      if (!mounted) return;

      setIsDesktopApp(isElectron());
      if (isElectron() && ENABLE_MAC_CHECK) {
        try {
          const addresses = (await getMacAddresses()) as any;
          if (mounted) {
            const currentMacAddress = addresses[0]?.address as string;
            setMacAddresses(currentMacAddress);
            setCookie("macAddress", currentMacAddress, {
              expires: new Date(expirationDate),
            });

            // Check if this is a special MAC address and set branch accordingly
            if (currentMacAddress && isKnownMacAddress(currentMacAddress)) {
              setCookie("branch", MAC_BRANCH_MAPPING[currentMacAddress], {
                path: '/',
                expires: new Date(expirationDate),
              });
            }
          }
        } catch (error) {
          console.error("Failed to get MAC addresses:", error);
        }
      }
      if (mounted) {
        setInitializing(false);
      }
    };

    checkPlatform();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ENABLE_MAC_CHECK || machineData) {
      onLogin();
    }
  }, [machineData]);

  const onLogin = async () => {
    if (pageLoading || (!machineData && ENABLE_MAC_CHECK)) {
      return;
    }

    setPageLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        userName,
        machineName: ENABLE_MAC_CHECK ? machineData?.machineName : undefined,
        isAdmin: false
      });
      
      const { statusCode, message } = result || {};

      if (statusCode === 200) {
        toast.success("Chào mừng đến với The GateWay!");
        router.push("/dashboard");
      } else if (statusCode === 500 || statusCode === 499) {
        toast.error(message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Đã có lỗi xảy ra khi đăng nhập");
    }
    setPageLoading(false);
  };

  if (initializing || pageLoading) {
    return (
      <div className="flex justify-center items-center">
        <Spin size="large" tip="Loading..." spinning={true} />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-2">
        <Image
          src="/logo.png"
          alt="Logo"
          className="rounded-full"
          width={100}
          height={100}
        />
      </div>
      {ENABLE_MAC_CHECK && !isDesktopApp && (
        <div>
          <p>MAC addresses are only available in the desktop app.</p>
          <p>Please download our desktop application to access this feature.</p>
        </div>
      )}
      <h3 className="text-red-500 mb-[20px]">
        Vui lòng nhập đúng tên tài khoản đang sử dụng. GateWay sẽ trao thưởng
        dựa trên thông tin này.
      </h3>

      <div className="mb-4">
        <Label htmlFor="email" className="block text-sm font-bold mb-2">
          Tên đăng nhập
        </Label>
        <Input
          id="email"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          disabled={initializing || (ENABLE_MAC_CHECK && !machineData)}
          onClick={onLogin}
          variant="default"
          className="w-full justify-start bg-orange-400"
          size="default"
        >
          Đăng nhập
        </Button>
      </div>
    </>
  );
};

export default Login;
