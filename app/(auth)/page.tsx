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
import { isElectron } from "@/lib/electron";
import { getMacAddresses } from "@/lib/mac";
import { useQuery } from "@tanstack/react-query";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

const Login = () => {
  const [userName, setUsername] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState(true);
  const loginMutation = useLogin();
  const router = useRouter();

  const [macAddresses, setMacAddresses] = useState<string>();
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const [cookiesSet, setCookiesSet] = useState(false);
  const [isToastShown, setIsToastShown] = useState(false);

  const { data: machineData } = useQuery({
    queryKey: ["check-branch", macAddresses],
    enabled: !!macAddresses && cookiesSet,
    queryFn: async () => {
      console.log("Fetching with macAddress:", macAddresses);
      const response = await fetch("/api/check-branch");
      const data = await response.json();

      if (data?.status !== "success") {
        toast.error(
          "Máy tính này chưa được đăng ký trong hệ thống. Vui lòng liên hệ quản trị viên.",
        );
        throw new Error("Unauthorized machine");
      }

      return data;
    },
  });

  // Query để check xem user đã tồn tại chưa
  const { data: existingUser } = useQuery({
    queryKey: ["check-existing-user", machineData?.machineName],
    enabled: !!machineData?.machineName,
    queryFn: async () => {
      const response = await fetch(
        `/api/user/check-existing?machineName=${machineData.machineName}`,
      );
      if (response.ok) {
        return await response.json();
      }
      return null;
    },
  });

  const onLoginForExistingUser = useCallback(async () => {
    if (pageLoading || !machineData || !existingUser || isToastShown) {
      return;
    }

    setPageLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        userName: existingUser.userName,
        machineName: machineData?.machineName,
        isAdmin: false,
      });

      const { statusCode, message } = result || {};

      if (statusCode === 200) {
        if (!isToastShown) {
          toast.success("Chào mừng trở lại The GateWay!");
          setIsToastShown(true);
        }
        router.push("/dashboard");
      } else if (statusCode === 500 || statusCode === 499) {
        toast.error(message);
      }
    } catch (error) {
      console.error("Auto-login error:", error);
      toast.error("Đã có lỗi xảy ra khi tự động đăng nhập");
    }
    setPageLoading(false);
  }, [pageLoading, machineData, existingUser, loginMutation, router, isToastShown]);

  useEffect(() => {
    let mounted = true;

    const checkPlatform = async () => {
      if (!mounted) return;

      setIsDesktopApp(isElectron());
      if (isElectron()) {
        try {
          const addresses = (await getMacAddresses()) as any;
          if (mounted) {
            const currentMacAddress = addresses[0]?.address as string;
            setMacAddresses(currentMacAddress);
            setCookie("macAddress", currentMacAddress, {
              expires: new Date(expirationDate),
            });
            setCookiesSet(true);
          }
        } catch (error) {
          console.error("Failed to get MAC addresses:", error);
          toast.error(
            "Không thể lấy thông tin MAC address. Vui lòng thử lại sau.",
          );
        }
      } else {
        toast.error("Vui lòng sử dụng ứng dụng desktop để đăng nhập.");
        setCookiesSet(true);
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
    if (machineData && existingUser) {
      // Auto-login chỉ khi user đã tồn tại trong DB
      console.log("Auto-login for existing user:", existingUser);
      setUsername(existingUser.userName || ""); // Set username từ DB
      onLoginForExistingUser();
    }
  }, [machineData, existingUser, onLoginForExistingUser]);

  const onLogin = async () => {
    if (pageLoading || !machineData || isToastShown) {
      return;
    }

    setPageLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        userName,
        machineName: machineData?.machineName,
        isAdmin: false,
      });

      const { statusCode, message } = result || {};

      if (statusCode === 200) {
        if (!isToastShown) {
          toast.success("Chào mừng đến với The GateWay!");
          setIsToastShown(true);
        }
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

  // Nếu đang khởi tạo hoặc loading, chỉ hiển thị loading
  if (initializing || pageLoading) {
    return (
      <div className="flex justify-center items-center">
        <Spin
          size="large"
          tip={existingUser ? "Đang tự động đăng nhập..." : "Loading..."}
          spinning={true}
        />
      </div>
    );
  }

  // Nếu có existingUser, chỉ auto-login, không render form đăng nhập nữa
  if (existingUser && machineData) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Logo"
            className="rounded-full"
            width={100}
            height={100}
          />
        </div>
        <Spin size="large" tip="Đang tự động đăng nhập..." spinning={true} />
        <p className="mt-4 text-green-500">
          Chào mừng trở lại, {existingUser.userName}!
        </p>
      </div>
    );
  }

  // Nếu chưa có existingUser, render form đăng nhập
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
      {!isDesktopApp && (
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
          disabled={initializing || !machineData}
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
