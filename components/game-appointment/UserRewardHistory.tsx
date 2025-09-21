"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Gift, 
  Calendar, 
  Gamepad2, 
  Crown,
  Loader2,
  Trophy,
  Clock
} from "lucide-react";

interface RewardHistoryItem {
  id: string;
  appointmentId: string;
  rewardType: string;
  rewardValue: string;
  quantity: number;
  status: string;
  distributedAt: string | null;
  appointment: {
    title: string;
    game: string;
    tier: string;
  };
}

interface UserRewardHistoryProps {
  userId: number;
}

export function UserRewardHistory({ userId }: UserRewardHistoryProps) {
  const [rewards, setRewards] = useState<RewardHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchRewards = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/rewards?limit=20&offset=${page * 20}`);
      const result = await response.json();

      if (result.success) {
        if (page === 0) {
          setRewards(result.data.rewards);
        } else {
          setRewards(prev => [...prev, ...result.data.rewards]);
        }
        setTotalCount(result.data.totalCount);
        setHasMore(result.data.rewards.length === 20);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards(0);
  }, [userId]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchRewards(currentPage + 1);
    }
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'DRINK':
        return <Gift className="h-4 w-4 text-blue-600" />;
      case 'FOOD':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'VOUCHER':
        return <Gift className="h-4 w-4 text-purple-600" />;
      case 'POINTS':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'COMBO':
        return <Gift className="h-4 w-4 text-orange-600" />;
      default:
        return <Gift className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRewardBadge = (rewardType: string) => {
    const typeConfig = {
      'DRINK': { label: 'Đồ uống', variant: 'default' as const },
      'FOOD': { label: 'Đồ ăn', variant: 'secondary' as const },
      'VOUCHER': { label: 'Voucher', variant: 'destructive' as const },
      'POINTS': { label: 'Điểm', variant: 'outline' as const },
      'COMBO': { label: 'Combo', variant: 'default' as const }
    };

    const config = typeConfig[rewardType as keyof typeof typeConfig] || typeConfig.DRINK;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DISTRIBUTED': { label: 'Đã nhận', variant: 'default' as const },
      'PENDING': { label: 'Chờ xử lý', variant: 'secondary' as const },
      'EXPIRED': { label: 'Hết hạn', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    if (!tier || tier === 'Unknown') return <Badge variant="outline">Unknown</Badge>;

    const tierConfig = {
      "tier_3p_3h": { label: "Bronze", color: "bg-amber-100 text-amber-800" },
      "tier_3p_5h": { label: "Silver", color: "bg-gray-100 text-gray-800" },
      "tier_5p_3h": { label: "Silver", color: "bg-gray-100 text-gray-800" },
      "tier_5p_5h": { label: "Gold", color: "bg-yellow-100 text-yellow-800" },
      "tier_allnight": { label: "Diamond", color: "bg-blue-100 text-blue-800" }
    };

    const config = tierConfig[tier as keyof typeof tierConfig] || { label: tier, color: "bg-gray-100 text-gray-800" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading && rewards.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Lịch sử phần thưởng
        </CardTitle>
        <CardDescription>
          Tổng cộng {totalCount} phần thưởng đã nhận
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Chưa có phần thưởng</h3>
            <p className="text-muted-foreground">Tham gia hẹn chơi để nhận phần thưởng hấp dẫn!</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getRewardIcon(reward.rewardType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">{reward.rewardValue}</h4>
                        {getRewardBadge(reward.rewardType)}
                        {getStatusBadge(reward.status)}
                        {reward.quantity > 1 && (
                          <Badge variant="outline">x{reward.quantity}</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-3 w-3" />
                          <span>{reward.appointment.game}</span>
                          {getTierBadge(reward.appointment.tier)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{reward.appointment.title}</span>
                        </div>
                        
                        {reward.distributedAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>Nhận lúc: {formatDateTime(reward.distributedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Tải thêm'
                  )}
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
