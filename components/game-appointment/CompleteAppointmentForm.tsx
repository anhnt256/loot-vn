"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Gift,
  Loader2,
  AlertCircle,
  Trophy
} from "lucide-react";

interface Member {
  id: string;
  userId: number;
  status: string;
  joinedAt: string;
  lockedAmount: number;
}

interface CompleteAppointmentFormProps {
  appointmentId: string;
  onComplete: (result: any) => void;
}

export function CompleteAppointmentForm({ appointmentId, onComplete }: CompleteAppointmentFormProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberStatuses, setMemberStatuses] = useState<Record<number, 'COMPLETED' | 'NO_SHOW'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/game-appointments/${appointmentId}`);
      const result = await response.json();

      if (result.success) {
        setMembers(result.data.members);
        // Initialize all members as completed
        const initialStatuses: Record<number, 'COMPLETED' | 'NO_SHOW'> = {};
        result.data.members.forEach((member: Member) => {
          initialStatuses[member.userId] = 'COMPLETED';
        });
        setMemberStatuses(initialStatuses);
      } else {
        setError(result.error || "Không thể tải thông tin thành viên");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải thông tin thành viên");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [appointmentId]);

  const handleStatusChange = (userId: number, status: 'COMPLETED' | 'NO_SHOW') => {
    setMemberStatuses(prev => ({
      ...prev,
      [userId]: status
    }));
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      const completedMembers = Object.entries(memberStatuses).map(([userId, status]) => ({
        userId: parseInt(userId),
        status
      }));

      const response = await fetch(`/api/game-appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedMembers })
      });

      const result = await response.json();

      if (result.success) {
        onComplete(result.data);
      } else {
        setError(result.error || "Không thể hoàn thành hẹn chơi");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi hoàn thành hẹn chơi");
    } finally {
      setIsCompleting(false);
    }
  };

  const completedCount = Object.values(memberStatuses).filter(status => status === 'COMPLETED').length;
  const noShowCount = Object.values(memberStatuses).filter(status => status === 'NO_SHOW').length;
  const totalLockedAmount = members.reduce((sum, member) => sum + member.lockedAmount, 0);
  const forfeitedAmount = members
    .filter(member => memberStatuses[member.userId] === 'NO_SHOW')
    .reduce((sum, member) => sum + member.lockedAmount, 0);

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
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Hoàn thành hẹn chơi
        </CardTitle>
        <CardDescription>
          Xác nhận trạng thái của các thành viên để phân phối phần thưởng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{noShowCount}</div>
            <div className="text-sm text-muted-foreground">Không tham gia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalLockedAmount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Tổng lock (VNĐ)</div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Thành viên ({members.length})</h3>
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">User #{member.userId}</p>
                  <p className="text-sm text-muted-foreground">
                    Lock: {member.lockedAmount.toLocaleString()} VNĐ
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={memberStatuses[member.userId] === 'COMPLETED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(member.userId, 'COMPLETED')}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Hoàn thành
                </Button>
                <Button
                  variant={memberStatuses[member.userId] === 'NO_SHOW' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(member.userId, 'NO_SHOW')}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Không tham gia
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Forfeited Amount Warning */}
        {forfeitedAmount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{forfeitedAmount.toLocaleString()} VNĐ</strong> sẽ bị chuyển vào quỹ Gateway từ các thành viên không tham gia.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Complete Button */}
        <Button 
          onClick={handleComplete} 
          disabled={isCompleting}
          className="w-full"
        >
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang hoàn thành...
            </>
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Hoàn thành và phân phối phần thưởng
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
