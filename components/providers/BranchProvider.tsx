"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { getFfoodTokenCookieName } from "@/lib/ffood-token-utils";

interface BranchContextType {
  branch: string;
  setBranch: (branch: string) => void;
  loginType: string | undefined;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within BranchProvider");
  }
  return context;
};

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [branch, setBranchState] = useState("GO_VAP");
  const [loginType, setLoginType] = useState<string | undefined>(undefined);

  // Load từ cookie khi mount
  useEffect(() => {
    const branchFromCookie = Cookies.get("branch");
    const loginTypeFromCookie = Cookies.get("loginType");

    if (branchFromCookie) {
      setBranchState(branchFromCookie);
    }
    setLoginType(loginTypeFromCookie);
  }, []);

  // When branch is set and user is admin: if ffood token cookie for this branch is missing, fetch from API (DB) to set cookie
  useEffect(() => {
    if (!branch || loginType !== "username") return;
    const ffoodCookieName = getFfoodTokenCookieName(branch);
    if (!Cookies.get(ffoodCookieName)) {
      fetch("/api/ffood-token", { credentials: "include" }).catch(() => {});
    }
  }, [branch, loginType]);

  // Hàm set branch và lưu vào cookie
  const setBranch = (newBranch: string) => {
    setBranchState(newBranch);
    Cookies.set("branch", newBranch, {
      expires: 7,
      sameSite: "lax",
    });

    // Refresh page để tất cả component tự động load lại data với branch mới
    window.location.reload();
  };

  return (
    <BranchContext.Provider value={{ branch, setBranch, loginType }}>
      {children}
    </BranchContext.Provider>
  );
};
