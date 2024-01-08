import { useEffect, useState } from "react";
import { CURRENT_USER } from "@/constants/token.constant";
import { User } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";

export const useUserInfo = () => {
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [userName, setUserName] = useState<number | undefined>();
  useEffect(() => {
    const currentUser = localStorage.getItem(CURRENT_USER) || "";
    const { id, login } = JSON.parse(currentUser);
    setCurrentUserId(id);
    setUserName(login);
  }, []);
  const branch = getCookie("branch");
  const { data: userData } = useQuery<User>({
    queryKey: ["user", currentUserId],
    enabled: !!currentUserId && !!branch,
    queryFn: () => fetcher(`/api/user/${currentUserId}/${branch}`),
  });
  const { data: todaySpentTime } = useQuery<number>({
    queryKey: ["today-spent-time", userName],
    enabled: !!userName,
    queryFn: () => fetcher(`/api/account/${userName}/today-spent-time`),
  });
  const { data: userCheckIn } = useQuery<[any]>({
    queryKey: ["check-in-result", currentUserId],
    enabled: !!userName,
    queryFn: () => fetcher(`/api/check-in-result/${currentUserId}`),
  });

  return { currentUserId, userName, userData, todaySpentTime, userCheckIn };
};
