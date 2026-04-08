import React, { useRef, useEffect, useState } from 'react';

interface PanContainerProps {
  children: React.ReactNode;
  width?: string;
  minHeight?: string;
  className?: string;
}

const PanContainer: React.FC<PanContainerProps> = ({ children, width = '2400px', minHeight = '2400px', className = '' }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let isPanActive = false;
    let startX = 0;
    let startY = 0;
    const startScrollLeft = 0;
    const startScrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow drag if not interacting with cards. Wait, in Dashboard the cards might have pointer events?
      // Actually cards have pointer events because of `onClick`! But Drag is only on background.
      if (target.closest('.react-grid-item')) return;
      if (e.button === 0 || e.button === 1) {
        isPanActive = true;
        setIsPanning(true);
        startX = e.clientX;
        startY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanActive) return;
      e.preventDefault();
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      startX = e.clientX;
      startY = e.clientY;
      
      let yNode: HTMLElement | null = el;
      let scrolledY = false;
      while (yNode) {
        if (yNode.scrollHeight > yNode.clientHeight) {
          const prevY = yNode.scrollTop;
          yNode.scrollTop -= dy;
          if (yNode.scrollTop !== prevY) {
            scrolledY = true;
            break;
          }
        }
        if (yNode === document.documentElement || yNode === document.body) break;
        yNode = yNode.parentElement;
      }
      if (!scrolledY) window.scrollBy(0, -dy);

      let xNode: HTMLElement | null = el;
      let scrolledX = false;
      while (xNode) {
        if (xNode.scrollWidth > xNode.clientWidth) {
          const prevX = xNode.scrollLeft;
          xNode.scrollLeft -= dx;
          if (xNode.scrollLeft !== prevX) {
            scrolledX = true;
            break;
          }
        }
        if (xNode === document.documentElement || xNode === document.body) break;
        xNode = xNode.parentElement;
      }
      if (!scrolledX) window.scrollBy(-dx, 0);
    };

    const onMouseUp = () => {
      if (isPanActive) {
        isPanActive = false;
        setIsPanning(false);
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div 
      className={`overflow-auto select-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'} ${className}`}
      ref={scrollContainerRef}
    >
      <div 
        style={{ 
          width, 
          minHeight,
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PanContainer;
