"use client";

import { ReactNode } from "react";
import StaffLayout from "../staff/layout";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return <StaffLayout>{children}</StaffLayout>;
}
