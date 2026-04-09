import React, { useEffect, useRef } from 'react';
import { App, Button, Space } from 'antd';
import { apiClient, getToken } from '@gateway-workspace/shared/utils';
import { io } from 'socket.io-client';

interface ReminderPayload {
  id: number;
  logId: number;
  title: string;
  description: string | null;
  startTime: string;
  assignee: string;
  repeatCount: number;
  repeatInterval: number;
  repeatMaxTimes: number;
}

export function useScheduleReminder() {
  const { notification } = App.useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Unlock audio on first click
  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current) {
        const audio = new Audio('/tingting.mp3');
        audio.volume = 1;
        audio.load();
        audioRef.current = audio;
      }
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('click', unlock);
    return () => document.removeEventListener('click', unlock);
  }, []);

  // Listen socket event from server cron
  useEffect(() => {
    const tenantId = apiClient.defaults.headers.common['x-tenant-id'] as string;
    if (!tenantId) return;

    const token = getToken();
    const socket = io(`${apiClient.defaults.baseURL ?? ''}/orders`, {
      auth: { tenantId, token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join:admin', { tenantId });
    });

    socket.on('schedule:reminder', (tasks: ReminderPayload[]) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      tasks.forEach(task => {
        const key = `schedule-${task.logId}`;
        const repeatLabel = task.repeatCount > 0 ? ` (nhắc lần ${task.repeatCount})` : '';
        const remainingRepeats = task.repeatMaxTimes - task.repeatCount;
        const hasMoreRepeats = task.repeatInterval > 0 && remainingRepeats > 0;

        const acknowledge = () => {
          apiClient.post(`/admin/schedule-tasks/logs/${task.logId}/acknowledge`).catch(() => {});
          notification.destroy(key);
        };

        const repeatInfo = hasMoreRepeats
          ? `Sẽ nhắc lại sau ${task.repeatInterval} phút (còn ${remainingRepeats} lần)`
          : task.repeatCount > 0
            ? 'Đây là lần nhắc cuối'
            : undefined;

        notification.warning({
          key,
          title: `${task.startTime} — ${task.title}${repeatLabel}`,
          description: React.createElement('div', null,
            React.createElement('div', null,
              `${task.assignee}${task.description ? ` — ${task.description}` : ''}`
            ),
            repeatInfo && React.createElement('div', {
              style: { marginTop: 4, fontSize: 12, color: '#faad14' },
            }, repeatInfo),
          ),
          placement: 'topRight',
          duration: 0,
          btn: React.createElement(Space, null,
            React.createElement(Button, {
              size: 'small',
              danger: true,
              onClick: acknowledge,
            }, 'Huỷ'),
            hasMoreRepeats && React.createElement(Button, {
              size: 'small',
              onClick: () => notification.destroy(key),
            }, 'Bỏ qua'),
            React.createElement(Button, {
              size: 'small',
              type: 'primary',
              onClick: acknowledge,
            }, 'OK'),
          ),
          closeIcon: false,
        });
      });
    });

    return () => { socket.disconnect(); };
  }, [notification]);
}
