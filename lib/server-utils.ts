import { cookies } from "next/headers";

export const getBranchFromCookie = async () => {
  const cookieStore = await cookies();
  const branch = cookieStore.get("branch")?.value;
  return branch;
};
