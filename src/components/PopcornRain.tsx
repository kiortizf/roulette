import { useEffect, useState, memo } from 'react';
import { Popcorn } from 'lucide-react';

interface Kernel {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

function PopcornRain() {
  const [kernels, setKernels] = useState<Kernel[]>([]);

  useEffect(() => {
    // Don't show on mobile to save battery
    if (window.innerWidth < 768) return;

    const newKernels: Kernel[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 0.6 + Math.random() * 0.8,
      opacity: 0.1 + Math.random() * 0.15,
    }));
    setKernels(newKernels);
  }, []);

  if (kernels.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes popcornFall {
          0% {
            transform: translateY(-50px) rotate(0deg);
          }
          100% {
            transform: translateY(calc(100vh + 50px)) rotate(360deg);
          }
        }
        @keyframes popcornWobble {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }
      `}</style>
      {kernels.map((kernel) => (
        <div
          key={kernel.id}
          className="absolute"
          style={{
            left: `${kernel.x}%`,
            top: '-50px',
            opacity: kernel.opacity,
            animation: `popcornFall ${kernel.duration}s linear infinite`,
            animationDelay: `${kernel.delay}s`,
          }}
        >
          <div
            style={{
              animation: `popcornWobble ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${kernel.delay}s`,
            }}
          >
            <Popcorn
              className="text-yellow-200"
              style={{
                width: `${kernel.size * 24}px`,
                height: `${kernel.size * 24}px`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(PopcornRain);
