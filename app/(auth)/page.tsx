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
import { Spin, Modal } from "antd";
import { isElectron } from "@/lib/electron";
import { getMacAddresses } from "@/lib/mac";
import { useQuery } from "@tanstack/react-query";
import { CURRENT_USER } from "@/constants/token.constant";

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
  const [loginFatalError, setLoginFatalError] = useState(false);
  const [fatalErrorMessage, setFatalErrorMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { data: machineData } = useQuery({
    queryKey: ["check-branch", macAddresses],
    enabled: !!macAddresses && cookiesSet,
    queryFn: async () => {
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
    if (
      pageLoading ||
      !machineData ||
      !existingUser ||
      isToastShown ||
      loginFatalError
    ) {
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

      if (
        statusCode === 500 &&
        message?.includes("Không lấy được thông tin user")
      ) {
        // Clear localStorage khi có lỗi fatal
        localStorage.removeItem(CURRENT_USER);
        setLoginFatalError(true);
        setFatalErrorMessage(message);
        setLoginSuccess(false);
        setPageLoading(false);
        return;
      }

      if (statusCode === 200) {
        setLoginSuccess(true);
        // Lưu thông tin user vào localStorage
        if (result.data) {
          localStorage.setItem(CURRENT_USER, JSON.stringify(result.data));
        }
        if (!isToastShown) {
          toast.success("Chào mừng trở lại The GateWay!");
          setIsToastShown(true);
        }
        router.push("/dashboard");
      } else if (statusCode === 500 || statusCode === 499) {
        setLoginSuccess(false);
        toast.error(message);
      }
    } catch (error) {
      setLoginSuccess(false);
      toast.error("Đã có lỗi xảy ra khi tự động đăng nhập");
    }
    setPageLoading(false);
  }, [
    pageLoading,
    machineData,
    existingUser,
    loginMutation,
    router,
    isToastShown,
    loginFatalError,
  ]);

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
    if (loginFatalError) return; // Nếu đã lỗi, không auto-login nữa
    if (machineData && existingUser) {
      // Auto-login chỉ khi user đã tồn tại trong DB
      setUsername(existingUser.userName || ""); // Set username từ DB
      onLoginForExistingUser();
    }
  }, [machineData, existingUser, loginFatalError]);

  const onLogin = async () => {
    if (pageLoading || !machineData || isToastShown || loginFatalError) {
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

      if (
        statusCode === 500 &&
        message?.includes("Không lấy được thông tin user")
      ) {
        // Clear localStorage khi có lỗi fatal
        localStorage.removeItem(CURRENT_USER);
        setLoginFatalError(true);
        setFatalErrorMessage(message);
        setLoginSuccess(false);
        setPageLoading(false);
        return;
      }

      if (statusCode === 200) {
        setLoginSuccess(true);
        // Lưu thông tin user vào localStorage
        if (result.data) {
          localStorage.setItem(CURRENT_USER, JSON.stringify(result.data));
        }
        if (!isToastShown) {
          toast.success("Chào mừng đến với The GateWay!");
          setIsToastShown(true);
        }
        router.push("/dashboard");
      } else if (statusCode === 500 || statusCode === 499) {
        setLoginSuccess(false);
        toast.error(message);
      }
    } catch (error) {
      setLoginSuccess(false);
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
  if (loginSuccess && existingUser && machineData) {
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

  // Nếu lỗi không lấy được thông tin user hoặc lỗi 500, chỉ render logo + thông báo lỗi
  if (loginFatalError) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex justify-center mb-2">
          <Image
            src="/logo.png"
            alt="Logo"
            className="rounded-full"
            width={100}
            height={100}
          />
        </div>
        <h3 className="text-red-500 text-center text-lg font-semibold mt-4">
          {fatalErrorMessage ||
            "Không lấy được thông tin user, vui lòng đăng nhập lại."}
        </h3>
        <button
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold"
          onClick={() => {
            if (isElectron()) {
              if (typeof window !== "undefined" && window.electron) {
                // @ts-ignore
                window.electron.send("close-app");
              } else {
                window.close();
              }
            } else {
              window.location.reload();
            }
          }}
        >
          Đăng xuất
        </button>
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
