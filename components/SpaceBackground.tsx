'use client';
import { useRef, useEffect } from 'react';

export default function SpaceBackground({ opacity = 1, fixed = false }: { opacity?: number; fixed?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf: number;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    let w = 0, h = 0;

    function resize() {
      const el = canvas!;
      w = fixed ? window.innerWidth : el.offsetWidth;
      h = fixed ? window.innerHeight : el.offsetHeight;
      el.width = Math.round(w * devicePixelRatio);
      el.height = Math.round(h * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function rand(a: number, b: number) { return Math.random() * (b - a) + a; }

    interface Star { x: number; y: number; r: number; base: number; speed: number; phase: number; spark: boolean; }
    const stars: Star[] = Array.from({ length: 140 }, () => ({
      x: rand(0, 1), y: rand(0, 1),
      r: rand(0.15, 1.1),
      base: rand(0.05, 0.35),
      speed: rand(0.005, 0.022),
      phase: rand(0, Math.PI * 2),
      spark: Math.random() < 0.13,
    }));

    interface Shooter { x: number; y: number; vx: number; vy: number; len: number; life: number; max: number; }
    const shooters: Shooter[] = [];
    let nextShoot = performance.now() + rand(8000, 18000);

    function spawnShooter() {
      const angleDeg = rand(20, 65);
      const angle = angleDeg * Math.PI / 180;
      const goLeft = Math.random() > 0.5;
      const spd = rand(2.5, 4.5);
      const vx = (goLeft ? -1 : 1) * Math.cos(angle) * spd;
      const vy = Math.sin(angle) * spd;
      const startX = goLeft ? rand(w * 0.3, w) : rand(0, w * 0.7);
      const startY = rand(0, h * 0.75);
      shooters.push({ x: startX, y: startY, vx, vy, len: rand(55, 115), life: 0, max: Math.floor(rand(55, 95)) });
    }

    let frame = 0;
    function draw(now: number) {
      frame++;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const alpha = Math.max(0, Math.min(1, s.base + Math.sin(frame * s.speed + s.phase) * 0.1)) * opacity;
        const sx = s.x * w, sy = s.y * h;
        ctx.globalAlpha = alpha;
        if (s.spark) {
          const arm = s.r * 2.2;
          ctx.beginPath();
          ctx.moveTo(sx, sy - arm); ctx.lineTo(sx, sy + arm);
          ctx.moveTo(sx - arm, sy); ctx.lineTo(sx + arm, sy);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = s.r * 0.5;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
        }
      }

      ctx.globalAlpha = opacity;
      if (now >= nextShoot) { spawnShooter(); nextShoot = now + rand(12000, 25000); }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i]; sh.life++;
        if (sh.life > sh.max) { shooters.splice(i, 1); continue; }
        const t = sh.life / sh.max;
        const alpha = (t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 1.8)) * opacity;
        const hx = sh.x + sh.vx * sh.life, hy = sh.y + sh.vy * sh.life;
        const spd = Math.sqrt(sh.vx * sh.vx + sh.vy * sh.vy);
        const nx = sh.vx / spd, ny = sh.vy / spd;
        const tx = hx - nx * sh.len, ty = hy - ny * sh.len;
        const g = ctx.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, `rgba(255,255,255,${alpha.toFixed(2)})`);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [opacity, fixed]);

  return (
    <canvas
      ref={ref}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
