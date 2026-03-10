import { UserRewardHistory } from "@gateway-workspace/shared/ui";
import { cookies } from "next/headers";
import { verifyJWT } from "@gateway-workspace/shared/utils";
import { redirect } from "next/navigation";

export default async function RewardsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) {
      redirect("/login");
    }

    const userId = parseInt(decoded.userId.toString());

    return (
      <div className="max-w-4xl mx-auto p-6">
        <UserRewardHistory userId={userId} />
      </div>
    );
  } catch (error) {
    redirect("/login");
  }
}
