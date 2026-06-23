import { useEffect, useRef } from 'react';
import { getPerformanceConfig } from '../utils/performanceFlags';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export const NetworkOverlay = ({ intensity = 0.5, speed = 0.3, isHero = false }: { intensity?: number, speed?: number, isHero?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const performanceConfig = getPerformanceConfig();

  // If canvas animations are disabled, render fallback background
  if (!performanceConfig.enableCanvasAnimations) {
    return (
      <div className={`${isHero ? 'absolute' : 'fixed'} inset-0 pointer-events-none z-0 bg-gradient-to-br from-amber-500/5 via-transparent to-red-900/5`}>
        {/* Optional: Add a subtle static pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #eab308 2px, transparent 2px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
    );
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    // Apply performance multiplier to particle count
    const baseParticleCount = isHero ? 50 : 35;
    const particleCount = Math.max(5, Math.floor(baseParticleCount * performanceConfig.particleMultiplier));
    const connectionDistance = isHero ? 300 : 220;

    const colors = ['#eab308', '#991b1b', '#fde047', '#450a0a']; // More balanced luxury colors

    const resize = () => {
      if (isHero) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * 2 + 1, // Smaller, more refined dots
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

        // Draw particle node with balanced visibility
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        const pulse = (Math.sin(time * 1.2 + i) + 1) * 0.5;
        ctx.globalAlpha = (0.3 + 0.4 * pulse) * intensity;
        ctx.fill();

        ctx.shadowBlur = 15; // Soft glow
        ctx.shadowColor = p1.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            const linePulse = (Math.sin(time * 1 + i + j) + 1) * 0.5;
            ctx.setLineDash([2, 8]); 
            ctx.lineDashOffset = -time * 10;
            
            const opacity = (1 - dist / connectionDistance) * (0.2 + 0.4 * linePulse) * intensity;
            ctx.strokeStyle = i % 2 === 0 ? '#eab308' : '#991b1b';
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 0.8; // Thinner, more elegant lines
            ctx.stroke();
            ctx.setLineDash([]); 
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, speed, isHero]);

  return (
    <canvas
      ref={canvasRef}
      className={`${isHero ? 'absolute' : 'fixed'} inset-0 pointer-events-none z-0`}
    />
  );
};
