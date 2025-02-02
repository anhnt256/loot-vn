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
import { currentTimeVN } from "@/lib/dayjs";
import { Spin } from "antd";
import { isElectron } from "@/lib/electron";
import { getMacAddresses } from "@/lib/mac";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

const Login = () => {
  const [login, setLogin] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const loginMutation = useLogin();
  const router = useRouter();

  const { execute } = useAction(createUser, {
    onSuccess: async (data) => {
      toast.success("Chào mừng đến với The GateWay!");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (error === "User has exist.") {
        toast.success("Chào mừng đến với The GateWay!");
        router.push("/dashboard");
      } else {
        toast.error(error);
      }
    },
  });

  const [macAddresses, setMacAddresses] = useState<string>();
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      setIsDesktopApp(isElectron());

      if (isElectron()) {
        try {
          const addresses = (await getMacAddresses()) as any;
          setMacAddresses(addresses[0]?.address);

          setCookie("macAddress", addresses[0]?.address, {
            expires: new Date(expirationDate),
          });

          onLogin();
        } catch (error) {
          console.error("Failed to get MAC addresses:", error);
        }
      } else {
        setCookie("macAddress", "dc:1b:a1:2d:e7:77", {
          expires: new Date(expirationDate),
        });
        onLogin();
      }
    };

    checkPlatform();
  }, []);

  const onLogin = async () => {
    if (pageLoading) {
      return;
    }

    setPageLoading(true);
    const result = await loginMutation.mutateAsync(login);
    setPageLoading(false);
    const { statusCode, data, message } = result || {};
    if (statusCode === 200) {
      await execute({
        userId: data,
        branch: getCookie("branch") || BRANCH.GOVAP,
        stars: 0,
        createdAt: currentTimeVN,
        rankId: 1,
      });
    } else if (statusCode === 500) {
      toast.error(message);
    } else if (statusCode === 700) {
      await execute({
        userId: data,
        branch: getCookie("branch") || BRANCH.GOVAP,
        stars: 0,
        createdAt: currentTimeVN,
        rankId: 1,
      });
      return;
    }
  };

  if (pageLoading) {
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
      {isDesktopApp ? (
        <div>
          <h2>
            MAC Addresses: <p>Address: {macAddresses}</p>
          </h2>
        </div>
      ) : (
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
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() => onLogin()}
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
