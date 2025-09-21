import { UserRewardHistory } from "@/components/game-appointment/UserRewardHistory";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
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

    const userId = parseInt(decoded.userId);

    return (
      <div className="max-w-4xl mx-auto p-6">
        <UserRewardHistory userId={userId} />
      </div>
    );
  } catch (error) {
    redirect("/login");
  }
}
