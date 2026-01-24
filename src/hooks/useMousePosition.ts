import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
  centerX: number; // -1 to 1, where 0 is center
  centerY: number; // -1 to 1, where 0 is center
}

export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    centerX: 0,
    centerY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = (e.clientX / window.innerWidth) * 2 - 1;
      const centerY = (e.clientY / window.innerHeight) * 2 - 1;

      setPosition({
        x: e.clientX,
        y: e.clientY,
        centerX,
        centerY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}
