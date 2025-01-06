import { useEffect, useMemo, useState } from "react";
import { CURRENT_USER } from "@/constants/token.constant";
import { User } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import dayjs from "@/lib/dayjs";

export const useUserInfo = () => {
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [activeUser, setActiveUser] = useState<number | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [userBalance, setUserBalance] = useState<any[]>([]);
  const [isNewUser, setIsNewUser] = useState<boolean | undefined>(false);

  useEffect(() => {
    const currentUser = localStorage.getItem(CURRENT_USER) || "";
    const userBalanceString = localStorage.getItem("userBalance");
    if (currentUser) {
      const { id, login, create_date, active_account } =
        JSON.parse(currentUser);
      setActiveUser(active_account?.id);
      setCurrentUserId(id);
      setUserName(login);

      const startDate = dayjs("2024-02-01");
      setIsNewUser(dayjs(create_date).isSameOrAfter(startDate));
    }
    if (userBalanceString) {
      setUserBalance(JSON.parse(userBalanceString));
    }
  }, []);
  const branch = getCookie("branch");
  const { data: userData } = useQuery<User>({
    queryKey: ["user", currentUserId],
    enabled: !!currentUserId && !!branch,
    queryFn: () => fetcher(`/api/user/${currentUserId}/${branch}`),
  });

  const { data: userCheckIn } = useQuery<[any]>({
    queryKey: ["check-in-result", currentUserId],
    enabled: !!userName,
    queryFn: () => fetcher(`/api/check-in-result/${currentUserId}/${branch}`),
  });

  const { data: checkInItem } = useQuery<[any]>({
    queryKey: ["check-in-item"],
    enabled: !!userName,
    queryFn: () => fetcher(`/api/check-in-item`),
  });

  return {
    currentUserId,
    userName,
    userData,
    userCheckIn,
    userBalance,
    checkInItem,
    isNewUser,
    activeUser,
  };
};
