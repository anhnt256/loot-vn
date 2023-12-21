"use client";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ACCESS_TOKEN_KEY } from "@/constants/token.contant";
import token from "@/lib/token";
import { postLogin } from "@/repositories/auth/authRepository";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const onLogin = async () => {
    postLogin({ login, password }).then((res) => {
      const result = res.data;
      const { token: userToken, user } = result || {};
      console.log("userToken", userToken);
      console.log("user", user);
      token.setToken(ACCESS_TOKEN_KEY, "meo");
    });
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
          placeholder="Vui lòng nhập tên đăng nhập"
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
          placeholder="Vui lòng nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onLogin}
          variant="default"
          className="w-full justify-start"
          size="default"
        >
          Đăng nhập
        </Button>
      </div>
    </>
  );
};

export default Login;
