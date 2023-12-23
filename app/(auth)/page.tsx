"use client";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";
import token from "@/lib/token";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/queries/auth.query";

const Login = () => {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const loginMutation = useLogin();
  const onLogin = async () => {
    const data = await loginMutation.mutateAsync({ login, password });
    console.log("data", data);
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
