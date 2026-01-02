"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLogin, verifyStaffUsername, updateStaffPassword } from "@/queries/auth.query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { setCookie } from "cookies-next";
import dayjs from "@/lib/dayjs";
import { Spin } from "antd";
import { UserIcon, LockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

const StaffLogin = () => {
  const [userName, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("GO_VAP");
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loginStep, setLoginStep] = useState<"username" | "password" | "reset">("username");
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [verifyingUsername, setVerifyingUsername] = useState<boolean>(false);
  const loginMutation = useLogin();
  const router = useRouter();

  const handleVerifyUsername = useCallback(async () => {
    if (verifyingUsername || !userName || !userName.trim()) {
      if (!userName || !userName.trim()) {
        toast.error("Vui lòng nhập tên đăng nhập");
      }
      return;
    }

    if (!selectedBranch || (selectedBranch !== "GO_VAP" && selectedBranch !== "TAN_PHU")) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }

    setVerifyingUsername(true);
    try {
      const result = await verifyStaffUsername(userName.trim(), selectedBranch);
      
      if (result.statusCode === 200 && result.data) {
        setStaffInfo(result.data);
        if (result.data.requirePasswordReset) {
          setLoginStep("reset");
        } else {
          setLoginStep("password");
        }
      } else {
        toast.error(result.message || "Tên đăng nhập không tồn tại");
      }
    } catch (error) {
      console.error("Error verifying username:", error);
      toast.error("Đã có lỗi xảy ra khi xác minh tên đăng nhập");
    } finally {
      setVerifyingUsername(false);
    }
  }, [userName, selectedBranch]);

  const handleUpdatePassword = useCallback(async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!staffInfo || !staffInfo.staffId) {
      toast.error("Thông tin nhân viên không hợp lệ");
      return;
    }

    if (!selectedBranch || (selectedBranch !== "GO_VAP" && selectedBranch !== "TAN_PHU")) {
      toast.error("Chi nhánh không hợp lệ");
      return;
    }

    setPageLoading(true);
    try {
      const result = await updateStaffPassword(staffInfo.staffId, newPassword, selectedBranch);
      
      if (result.statusCode === 200) {
        toast.success("Cập nhật mật khẩu thành công. Vui lòng đăng nhập.");
        setNewPassword("");
        setConfirmPassword("");
        setLoginStep("password");
      } else {
        toast.error(result.message || "Cập nhật mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Đã có lỗi xảy ra khi cập nhật mật khẩu");
    } finally {
      setPageLoading(false);
    }
  }, [newPassword, confirmPassword, staffInfo, selectedBranch]);

  const handleLogin = useCallback(
    async () => {
      if (pageLoading) return;

      if (loginStep === "username") {
        handleVerifyUsername();
        return;
      }

      if (!userName || !password) {
        toast.error("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
        return;
      }

      if (!selectedBranch || (selectedBranch !== "GO_VAP" && selectedBranch !== "TAN_PHU")) {
        toast.error("Vui lòng chọn chi nhánh");
        return;
      }

      setPageLoading(true);
      try {
        // Set cookies
        if (selectedBranch && (selectedBranch === "GO_VAP" || selectedBranch === "TAN_PHU")) {
          setCookie("branch", selectedBranch, {
            path: "/",
            expires: new Date(expirationDate),
          });
        }
        setCookie("loginType", "account", {
          path: "/",
          expires: new Date(expirationDate),
        });

        const result = await loginMutation.mutateAsync({
          userName: userName,
          isAdmin: true,
          password: password,
          loginMethod: "account",
          branch: selectedBranch,
        });

        const { statusCode, message } = result || {};

        if (statusCode === 200) {
          toast.success("Đăng nhập thành công!");
          // Always redirect to /staff page
          router.push("/staff");
        } else if (statusCode === 403 && result?.data?.requirePasswordReset) {
          toast.error("Vui lòng đặt mật khẩu mới");
          setLoginStep("reset");
        } else if (statusCode === 500 || statusCode === 499 || statusCode === 401) {
          toast.error(message || "Đăng nhập thất bại");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Đã có lỗi xảy ra khi đăng nhập");
      }
      setPageLoading(false);
    },
    [pageLoading, userName, password, selectedBranch, loginMutation, router, loginStep, handleVerifyUsername],
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
              <h1 className="text-2xl font-bold text-white">Staff Portal</h1>
              <p className="text-gray-400 text-sm">
                Đăng nhập nhân viên
              </p>
            </div>

            <div className="w-full space-y-4">
              {loginStep === "username" && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="branch"
                      className="text-sm font-medium text-gray-200"
                    >
                      Chi nhánh
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="branch"
                          value="GO_VAP"
                          checked={selectedBranch === "GO_VAP"}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-4 h-4 text-orange-500"
                          disabled={verifyingUsername}
                        />
                        <span className="text-gray-300">Gò Vấp</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="branch"
                          value="TAN_PHU"
                          checked={selectedBranch === "TAN_PHU"}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-4 h-4 text-orange-500"
                          disabled={verifyingUsername}
                        />
                        <span className="text-gray-300">Tân Phú</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-200"
                    >
                      Tên đăng nhập
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        id="username"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleVerifyUsername();
                          }
                        }}
                        disabled={verifyingUsername}
                      />
                    </div>
                  </div>
                  {staffInfo && (
                    <div className="text-sm text-gray-400">
                      Nhân viên: {staffInfo.fullName}
                    </div>
                  )}
                </>
              )}

              {loginStep === "password" && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="username-display"
                      className="text-sm font-medium text-gray-200"
                    >
                      Tên đăng nhập
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        id="username-display"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                        value={userName}
                        disabled
                      />
                    </div>
                  </div>
                  {staffInfo && (
                    <div className="text-sm text-gray-400 mb-2">
                      Nhân viên: {staffInfo.fullName}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-200"
                    >
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleLogin();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-gray-400 hover:text-gray-300"
                    onClick={() => {
                      setLoginStep("username");
                      setPassword("");
                    }}
                  >
                    ← Quay lại
                  </Button>
                </>
              )}

              {loginStep === "reset" && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="username-display-reset"
                      className="text-sm font-medium text-gray-200"
                    >
                      Tên đăng nhập
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        id="username-display-reset"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                        value={userName}
                        disabled
                      />
                    </div>
                  </div>
                  {staffInfo && (
                    <div className="text-sm text-gray-400 mb-2">
                      Nhân viên: {staffInfo.fullName}
                    </div>
                  )}
                  <div className="text-sm text-orange-400 mb-4">
                    Vui lòng đặt mật khẩu mới
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium text-gray-200"
                    >
                      Mật khẩu mới
                    </Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        id="newPassword"
                        type="password"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdatePassword();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-200"
                    >
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu mới"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdatePassword();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-gray-400 hover:text-gray-300"
                    onClick={() => {
                      setLoginStep("username");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    ← Quay lại
                  </Button>
                </>
              )}

              {/* Action Button */}
              {loginStep === "username" ? (
                <Button
                  onClick={handleVerifyUsername}
                  disabled={verifyingUsername || !userName || !userName.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                  size="lg"
                >
                  {verifyingUsername ? "Đang xác minh..." : "Tiếp tục"}
                </Button>
              ) : loginStep === "reset" ? (
                <Button
                  onClick={handleUpdatePassword}
                  disabled={pageLoading || !newPassword || !confirmPassword}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                  size="lg"
                >
                  {pageLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={pageLoading || !password}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                  size="lg"
                >
                  {pageLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffLogin;

