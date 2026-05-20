'use client';

import { useEffect, useRef } from 'react';

const SPACING = 30;
const REPEL_RADIUS = 150;
const REPEL_FORCE = 80;

/**
 * Canvas interativo com grid de pontos que se repelem do mouse.
 * Posicionamento: absolute inset-0 — preencher o pai (que precisa ser relative).
 * Respeita prefers-reduced-motion.
 */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    interface Dot {
      ox: number;
      oy: number;
      x: number;
      y: number;
      size: number;
    }

    let dots: Dot[] = [];
    const mouse = { x: -1000, y: -1000 };
    let rafId = 0;

    function buildDots() {
      dots = [];
      const cols = Math.ceil(canvas!.width / SPACING);
      const rows = Math.ceil(canvas!.height / SPACING);
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const ox = i * SPACING;
          const oy = j * SPACING;
          dots.push({
            ox,
            oy,
            x: ox,
            y: oy,
            size: Math.random() * 0.8 + 0.6
          });
        }
      }
    }

    function resize() {
      canvas!.width = parent!.offsetWidth;
      canvas!.height = parent!.offsetHeight;
      buildDots();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const d of dots) {
        const dx = d.ox - mouse.x;
        const dy = d.oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const angle = Math.atan2(dy, dx);
          d.x = d.ox + Math.cos(angle) * force * REPEL_FORCE;
          d.y = d.oy + Math.sin(angle) * force * REPEL_FORCE;
        } else {
          d.x += (d.ox - d.x) * 0.1;
          d.y += (d.oy - d.y) * 0.1;
        }

        const opacity =
          dist < REPEL_RADIUS
            ? 0.15 + ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.6
            : 0.15;

        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(63, 189, 180, ${opacity})`;
        ctx!.fill();
      }
      rafId = requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function handleMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    resize();
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
}
