import { useEffect, useMemo, useState } from "react";
import { CURRENT_USER } from "@/constants/token.constant";
import { User } from "@/prisma/generated/prisma-client";
import { fetcher } from "@/lib/fetcher";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import dayjs from "@/lib/dayjs";

export const useUserInfo = () => {
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [userBalance, setUserBalance] = useState<any[]>([]);
  const [isNewUser, setIsNewUser] = useState<boolean | undefined>(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const currentUser = localStorage.getItem(CURRENT_USER) || "";
    const userBalanceString = localStorage.getItem("userBalance");

    if (currentUser) {
      const { userId, userName, createdAt } = JSON.parse(currentUser);
      setCurrentUserId(userId);
      setUserName(userName);

      const startDate = dayjs("2024-02-01");
      setIsNewUser(dayjs(createdAt).isSameOrAfter(startDate));
    }
    if (userBalanceString) {
      setUserBalance(JSON.parse(userBalanceString));
    }
  }, []);

  const branch = useMemo(() => {
    return getCookie("branch");
  }, []);

  const { data: userData } = useQuery<User>({
    queryKey: ["user", currentUserId],
    enabled: !!currentUserId && !!branch,
    queryFn: () => fetcher(`/api/user/${currentUserId}/${branch}`),
  });

  const refreshUserData = () => {
    queryClient.invalidateQueries({ queryKey: ["user", currentUserId] });
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return {
    currentUserId,
    userName,
    userData,
    userBalance,
    isNewUser,
    refreshUserData,
    branch,
  };
};

export const useUserCheckIn = (currentUserId: number | undefined, branch: string | undefined) => {
  const { data: userCheckIn } = useQuery<[any]>({
    queryKey: ["check-in-result", currentUserId],
    enabled: !!currentUserId && !!branch,
    queryFn: () => fetcher(`/api/check-in-result/${currentUserId}/${branch}`),
  });
  return { userCheckIn };
};

export const useCheckInItem = () => {
  const { data: checkInItem } = useQuery<[any]>({
    queryKey: ["check-in-item"],
    queryFn: () => fetcher(`/api/check-in-item`),
  });
  return { checkInItem };
};
