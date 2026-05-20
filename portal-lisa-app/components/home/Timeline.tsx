'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eyebrow } from '@/components/ui/Eyebrow';
import type { TimelineEvent } from '@/lib/mock/home-content';

gsap.registerPlugin(ScrollTrigger);

interface TimelineProps {
  events: TimelineEvent[];
  sectionLabel: string;
  sectionTitlePart1: string;
  sectionTitleAccent: string;
  sectionDescription: string;
}

/**
 * Timeline horizontal com pinning + scroll hijacking via GSAP ScrollTrigger.
 * Converte scroll vertical em movimento horizontal do track.
 *
 * Lifecycle:
 * - setup() calcula altura virtual do wrapper baseado em trackWidth
 * - resize handler com debounce 250ms recria o trigger
 * - cleanup mata todos os ScrollTriggers no unmount
 */
export function Timeline({
  events,
  sectionLabel,
  sectionTitlePart1,
  sectionTitleAccent,
  sectionDescription
}: TimelineProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!wrapper || !pin || !track) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    function setup() {
      const trackWidth = track!.scrollWidth;
      const viewportWidth = window.innerWidth;
      const horizontalDistance = trackWidth - viewportWidth;

      if (horizontalDistance <= 0) return;

      wrapper!.style.height = `${window.innerHeight + horizontalDistance}px`;

      gsap.to(track, {
        x: -horizontalDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${horizontalDistance}`,
          pin: true,
          pinSpacing: false,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      ScrollTrigger.refresh();
    }

    function teardown() {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    }

    setup();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        teardown();
        setup();
      }, 250);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      teardown();
    };
  }, []);

  return (
    <section className="relative border-t border-line">
      <div className="max-w-[1600px] mx-auto px-8 pt-32 pb-16">
        <div className="flex items-start gap-6 mb-12">
          <span className="text-[11px] font-semibold tracking-section opacity-40 tabular-nums">
            [ 04 ]
          </span>
          <Eyebrow>{sectionLabel}</Eyebrow>
        </div>
        <h2 className="font-display text-[clamp(36px,5vw,72px)] font-extralight leading-[1.05] tracking-[-0.04em] mb-4">
          {sectionTitlePart1}{' '}
          <span className="italic font-thin text-accent-glow">
            {sectionTitleAccent}
          </span>
        </h2>
        <p className="text-lg opacity-60 font-light max-w-2xl">
          {sectionDescription}
        </p>
      </div>

      <div ref={wrapperRef}>
        <div
          ref={pinRef}
          className="relative h-screen overflow-hidden w-full"
        >
          {/* Linha horizontal central */}
          <div
            className="absolute top-1/2 left-0 right-0 h-px bg-line-strong -translate-y-1/2 pointer-events-none z-[1]"
            aria-hidden="true"
          />

          <div
            ref={trackRef}
            className="flex h-full items-center px-[8vw] gap-[6vw] will-change-transform"
          >
            {events.map((event) => (
              <div
                key={event.year}
                className="flex-shrink-0 w-[380px] relative"
              >
                <div className="font-display text-[96px] font-extralight tracking-[-0.05em] leading-none text-accent-glow">
                  {event.year}
                </div>
                <div
                  className="w-3 h-3 bg-accent border-2 border-bg-base my-6 relative z-[2]"
                  style={{
                    boxShadow:
                      '0 0 0 1px var(--accent-glow), 0 0 20px rgba(46, 163, 155, 0.6)'
                  }}
                />
                <Eyebrow
                  className={event.highlight ? '' : 'mb-3 block'}
                >
                  {event.eyebrow}
                </Eyebrow>
                <p className="text-sm opacity-70 leading-relaxed mt-3">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
