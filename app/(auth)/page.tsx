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
import { useEnhancedFingerprint } from "@/hooks/useFingerprint";
import { getCookie, setCookie } from "cookies-next";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
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
  const { fingerprint } = useEnhancedFingerprint();

  console.log("fingerprint", fingerprint);

  setCookie("fingerprint", fingerprint, {
    expires: new Date(expirationDate),
  });

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

  const [macAddresses, setMacAddresses] = useState<any>([]);
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      setIsDesktopApp(isElectron());

      if (isElectron()) {
        try {
          const addresses = await getMacAddresses();
          setMacAddresses(addresses);
        } catch (error) {
          console.error("Failed to get MAC addresses:", error);
        }
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

  useEffect(() => {
    if (!isEmpty(fingerprint)) {
      onLogin();
    }
  }, [fingerprint]);

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center">
        <Spin size="large" tip="Loading..." spinning={true} />
      </div>
    );
  }

  if (!isEmpty(fingerprint)) {
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

        <h3 className="text-red-500 mb-[20px]">
          Vui lòng nhập đúng tên tài khoản đang sử dụng. GateWay sẽ trao thưởng
          dựa trên thông tin này.
        </h3>

        {isDesktopApp ? (
          <div>
            <h2>MAC Addresses:</h2>
            {macAddresses.map((mac: any, index: number) => (
              <div key={index}>
                <p>Interface: {mac.name}</p>
                <p>Address: {mac.address}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>MAC addresses are only available in the desktop app.</p>
            <p>
              Please download our desktop application to access this feature.
            </p>
          </div>
        )}

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
  } else {
    return (
      <div className="flex justify-center items-center">
        <Spin size="large" tip="Loading..." spinning={true} />
      </div>
    );
  }
};

export default Login;
