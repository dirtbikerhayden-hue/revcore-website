'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      // Both elements update directly — ring trails via CSS transition (compositor thread)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // Force cursor:none on every element — prevents pointer/default styles flashing the native cursor
    const style = document.createElement('style');
    style.id = 'custom-cursor-hide';
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.getElementById('custom-cursor-hide')?.remove();
    };
  }, []);

  return (
    <>
      {/* Dot — white + mix-blend-mode:difference → appears black on white, white on dark */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'white',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 9999,
          marginLeft: '-3px',
          marginTop: '-3px',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: '1.5px solid white',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 9998,
          marginLeft: '-15px',
          marginTop: '-15px',
          willChange: 'transform',
          transition: 'transform 90ms ease-out',
        }}
      />
    </>
  );
}
