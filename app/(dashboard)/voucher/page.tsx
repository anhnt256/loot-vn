"use client";

import { Reward } from "@/prisma/generated/prisma-client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState, useEffect } from "react";
import VoucherList from "@/app/(dashboard)/voucher/VoucherList/VoucherList";
import { getCookie } from "cookies-next";
import { BRANCH } from "@/constants/enum.constant";
import { CURRENT_USER } from "@/constants/token.constant";

const Voucher = () => {
  const [userData, setUserData] = useState<any>(null);
  const { userId, branch } = userData || {};

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userDataString = localStorage.getItem(CURRENT_USER);
      if (userDataString) {
        try {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }
  }, []);

  const { data: vouchers } = useQuery<[any]>({
    queryKey: ["vouchers"],
    enabled: !!userData,
    queryFn: () => fetcher(`/api/reward/${userId}/${branch}`),
  });

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full overflow-auto max-h-[89vh]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2 mr-4">Kho voucher</h2>
        </div>

        <div id="calendar" className="overflow-y-auto">
          <VoucherList vouchers={vouchers} />
        </div>
      </div>
    </div>
  );
};

export default Voucher;
