"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellRing,
  Calendar,
  Users,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Loader2,
} from "lucide-react";

interface Notification {
  id: string;
  type:
    | "APPOINTMENT_CREATED"
    | "APPOINTMENT_JOINED"
    | "APPOINTMENT_LEFT"
    | "TIER_CHANGED"
    | "APPOINTMENT_COMPLETED"
    | "APPOINTMENT_CANCELLED";
  appointmentId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationCenterProps {
  userId: number;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // This would fetch from your notifications API
      // For now, we'll simulate some notifications
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "APPOINTMENT_CREATED",
          appointmentId: "app-1",
          title: "Hẹn chơi đã được tạo thành công!",
          message:
            'Hẹn chơi "Valorant Ranked" cho game Valorant đã được tạo thành công.',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: {
            appointmentTitle: "Valorant Ranked",
            game: "Valorant",
            tier: "tier_5p_5h",
          },
        },
        {
          id: "2",
          type: "TIER_CHANGED",
          appointmentId: "app-1",
          title: "Tier hẹn chơi đã thay đổi!",
          message:
            'Tier của hẹn chơi "Valorant Ranked" đã thay đổi từ Silver sang Gold. Bạn được hưởng promotion: Đồng Đội Đồng Lòng',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          data: {
            appointmentTitle: "Valorant Ranked",
            oldTier: "tier_5p_3h",
            newTier: "tier_5p_5h",
            promotion: {
              promotion: "Đồng Đội Đồng Lòng",
              description:
                "Mỗi thành viên mua 1 suất ăn bất kỳ, được tặng 1 combo (Nước + Snack)",
              minNetProfit: 42500,
            },
          },
        },
        {
          id: "3",
          type: "APPOINTMENT_JOINED",
          appointmentId: "app-2",
          title: "Có thành viên mới tham gia!",
          message:
            'Có thành viên mới tham gia hẹn chơi "League of Legends". Hiện tại có 4/5 thành viên.',
          isRead: true,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          data: {
            appointmentTitle: "League of Legends",
            currentMembers: 4,
            maxMembers: 5,
          },
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      // This would call your API to mark notification as read
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // This would call your API to mark all notifications as read
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT_CREATED":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "APPOINTMENT_JOINED":
        return <Users className="h-4 w-4 text-green-600" />;
      case "APPOINTMENT_LEFT":
        return <Users className="h-4 w-4 text-orange-600" />;
      case "TIER_CHANGED":
        return <Gift className="h-4 w-4 text-purple-600" />;
      case "APPOINTMENT_COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "APPOINTMENT_CANCELLED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const typeConfig = {
      APPOINTMENT_CREATED: { label: "Tạo mới", variant: "default" as const },
      APPOINTMENT_JOINED: { label: "Tham gia", variant: "secondary" as const },
      APPOINTMENT_LEFT: { label: "Rời", variant: "outline" as const },
      TIER_CHANGED: { label: "Thay đổi tier", variant: "destructive" as const },
      APPOINTMENT_COMPLETED: {
        label: "Hoàn thành",
        variant: "secondary" as const,
      },
      APPOINTMENT_CANCELLED: { label: "Hủy", variant: "destructive" as const },
    };

    const config =
      typeConfig[type as keyof typeof typeConfig] ||
      typeConfig.APPOINTMENT_CREATED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  if (isLoading) {
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Thông báo
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <CardDescription>
          Thông báo về các hoạt động hẹn chơi của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Không có thông báo</h3>
            <p className="text-muted-foreground">
              Bạn sẽ nhận được thông báo khi có hoạt động mới
            </p>
          </div>
        ) : (
          <div className="h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    notification.isRead
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  }`}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification.id)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {notification.title}
                        </h4>
                        {getNotificationBadge(notification.type)}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
