import { useEffect, useState, useCallback } from 'react';
import { Popcorn } from 'lucide-react';
import { soundManager } from '@/lib/sounds';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
  opacity: number;
  createdAt: number;
}

export default function ClickExplosion() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createExplosion = useCallback((clientX: number, clientY: number) => {
    soundManager.pop();

    const newParticles: Particle[] = Array.from({ length: 10 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.5;
      const velocity = 150 + Math.random() * 150;
      return {
        id: Date.now() + i,
        x: clientX,
        y: clientY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 100, // Initial upward boost
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 1,
        createdAt: Date.now(),
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Handle clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't trigger on buttons or interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input')) return;

      createExplosion(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [createExplosion]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    let animationId: number;
    const gravity = 800; // pixels per second squared

    const animate = () => {
      setParticles((prev) => {
        const now = Date.now();
        return prev
          .map((p) => {
            const elapsed = (now - p.createdAt) / 1000;
            const newX = p.x + p.vx * 0.016;
            const newVy = p.vy + gravity * 0.016;
            const newY = p.y + newVy * 0.016;
            const newOpacity = Math.max(0, 1 - elapsed * 1.2);
            const newRotation = p.rotation + 5;

            return {
              ...p,
              x: newX,
              y: newY,
              vy: newVy,
              rotation: newRotation,
              opacity: newOpacity,
            };
          })
          .filter((p) => p.opacity > 0 && p.y < window.innerHeight + 100);
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [particles.length > 0]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`,
            opacity: particle.opacity,
            willChange: 'transform, opacity',
          }}
        >
          <Popcorn className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
        </div>
      ))}
    </div>
  );
}
