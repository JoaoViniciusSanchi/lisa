'use client';

import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  target: number;
  duration?: number;
}

/**
 * Contador animado que dispara via IntersectionObserver quando entra na viewport.
 * Anima uma vez e desconecta o observer.
 */
export function StatCounter({ target, duration = 2000 }: StatCounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const start = performance.now();

            function tick(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.floor(eased * target));

              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                setValue(target);
              }
            }

            requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span
      ref={ref}
      className="font-display text-[clamp(72px,10vw,144px)] font-extralight tracking-[-0.06em] leading-[0.9] tabular-nums block"
      style={{
        background:
          'linear-gradient(180deg, var(--warm-white) 0%, rgba(244, 239, 230, 0.3) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent'
      }}
    >
      {value}
    </span>
  );
}
