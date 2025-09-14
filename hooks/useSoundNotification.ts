import { useRef, useCallback } from 'react';

interface UseSoundNotificationOptions {
  soundFile?: string;
  enabled?: boolean;
}

export function useSoundNotification(options: UseSoundNotificationOptions = {}) {
  const { soundFile = '/sounds/doi_thuong.mp3', enabled = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    if (!enabled) return;

    try {
      // Tạo audio element mới mỗi lần để có thể phát nhiều lần
      const audio = new Audio(soundFile);
      audio.volume = 0.7; // Volume 70%
      
      // Phát âm thanh
      audio.play().catch((error) => {
        console.warn('Không thể phát âm thanh:', error);
        // Thử phát lại sau 100ms
        setTimeout(() => {
          audio.play().catch(() => {});
        }, 100);
      });
    } catch (error) {
      console.warn('Lỗi khi tạo audio:', error);
    }
  }, [soundFile, enabled]);

  const playNotification = useCallback((currentValue: number, previousValue: number) => {
    // Chỉ phát âm thanh khi giá trị tăng (có pending mới)
    if (currentValue > previousValue && currentValue > 0) {
      playSound();
    }
  }, [playSound]);

  return {
    playSound,
    playNotification,
  };
}
