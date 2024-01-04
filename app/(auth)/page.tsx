"use client";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/queries/auth.query";
import { useAction } from "@/hooks/use-action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createUser } from "@/actions/create-user";

const Login = () => {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const loginMutation = useLogin();
  const router = useRouter();

  const { execute } = useAction(createUser, {
    onSuccess: () => {
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

  const onLogin = async () => {
    const result = await loginMutation.mutateAsync({ login, password });
    const { statusCode, data } = result || {};
    if (statusCode === 200) {
      await execute({ userId: data });
    }
  };

  return (
    <>
      <div className="flex justify-center mb-2">
        <Image
          src="/logo.jpg"
          alt="Logo"
          className="rounded-full"
          width={100}
          height={100}
        />
      </div>

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

      <div className="mb-6">
        <Label htmlFor="password" className="block text-sm font-bold mb-2">
          Mật khẩu
        </Label>
        <Input
          type="password"
          id="password"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onLogin}
          variant="default"
          className="w-full justify-start mr-4 bg-red-400"
          size="default"
        >
          Đăng nhập Gò Vấp
        </Button>
        <Button
          onClick={onLogin}
          variant="default"
          className="w-full justify-start bg-blue-400"
          size="default"
        >
          Đăng nhập Tân Phú
        </Button>
      </div>
    </>
  );
};

export default Login;
