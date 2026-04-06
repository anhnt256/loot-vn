import React, { useCallback, useEffect, useState, useRef } from 'react';

interface MeteorEffectProps {
  show: boolean;
  rarity?: number;
  isSingle?: boolean;
  setShowMeteor: (show: boolean) => void;
  openModal: () => void;
}

const MeteorEffect: React.FC<MeteorEffectProps> = ({
  show = false,
  rarity = 3,
  isSingle = true,
  setShowMeteor,
  openModal,
}) => {
  const [showSkipButton, setShowSkipButton] = useState<boolean>(true);
  const videoContent = useRef<HTMLVideoElement | null>(null);

  const meteorEnd = useCallback(
    ({ skip = false }: { skip?: boolean } = {}): void => {
      console.log(skip ? 'Animation skipped' : 'Animation ended');
      setShowMeteor(false);
      setShowSkipButton(false);
      openModal();
    },
    [setShowMeteor, openModal],
  );

  const skip = (): void => {
    meteorEnd({ skip: true });
    if (videoContent.current) {
      videoContent.current.pause();
      videoContent.current.style.display = 'none';
    }
  };

  const showVideoHandle = async (rarity: number, single = true): Promise<void> => {
    let vidSrc = '/videos/3star-single.mp4';

    if (single && rarity !== 3) {
      vidSrc = rarity === 5 ? '/videos/5star-single.mp4' : '/videos/4star-single.mp4';
    } else if (!single && rarity !== 3) {
      vidSrc = rarity === 5 ? '/videos/5star-multi.mp4' : '/videos/4star-multi.mp4';
    }

    if (videoContent.current) {
      videoContent.current.src = vidSrc;
      videoContent.current.style.display = 'block';
      videoContent.current.muted = false;
      await videoContent.current.play();
    }
  };

  useEffect(() => {
    if (show) {
      showVideoHandle(rarity, isSingle);
    }
  }, [show, rarity, isSingle]);

  useEffect(() => {
    const video = videoContent.current;
    if (!video) return;

    const handleEnded = () => meteorEnd();
    const handleError = () => {
      console.error(`Failed to load video: ${video.error?.message || 'Unknown error'}`);
      meteorEnd();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [meteorEnd]);

  return (
    <div
      className={`fixed inset-0 z-[9998] ${show ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
    >
      <div
        className={`absolute inset-0 bg-black ${show ? 'block' : 'hidden'}`}
        onMouseDown={() => setShowSkipButton(true)}
      >
        <video
          ref={videoContent}
          playsInline
          className="hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] object-cover"
        >
          <track kind="captions" />
        </video>
        {showSkipButton && (
          <button
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold text-lg shadow-lg border-2 border-gray-600 transition-all duration-200 hover:scale-105 z-[9999]"
            onClick={skip}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default MeteorEffect;
