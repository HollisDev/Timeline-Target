'use client';

import { Button } from '@/components/ui/Button';
import { Spotlight } from '@/components/ui/spotlight';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef } from 'react';

export default function SpotlightHero() {
  const headline = useMemo(() => 'Search Your Videos\nLike Never Before', []);
  const subline = useMemo(
    () =>
      'Upload videos, get instant transcriptions, and search through content with pinpoint accuracy. Start with 8 free processing credits - no credit card required.',
    []
  );

  // Refs for all character spans to animate
  const charRefs = useRef<HTMLSpanElement[]>([]);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const subCharRefs = useRef<HTMLSpanElement[]>([]);
  subCharRefs.current = [];
  charRefs.current = [];

  const registerChar = (el: HTMLSpanElement | null) => {
    if (el && !charRefs.current.includes(el)) {
      charRefs.current.push(el);
    }
  };

  const registerSubChar = (el: HTMLSpanElement | null) => {
    if (el && !subCharRefs.current.includes(el)) {
      subCharRefs.current.push(el);
    }
  };

  useLayoutEffect(() => {
    if (!charRefs.current.length && !subCharRefs.current.length) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Ensure initial hidden state to avoid flash before animation
    if (contentRef.current)
      gsap.set(contentRef.current, { visibility: 'visible' });
    gsap.set(charRefs.current, { y: 36, opacity: 0 });
    gsap.set(subCharRefs.current, { y: 36, opacity: 0 });
    if (ctaRef.current)
      gsap.set(ctaRef.current.children, { y: 24, opacity: 0 });

    // Animate headline and subheadline concurrently; match speeds
    tl.addLabel('text')
      .to(
        charRefs.current,
        { y: 0, opacity: 1, duration: 1.0, stagger: { each: 0.03 } },
        'text'
      )
      .to(
        subCharRefs.current,
        { y: 0, opacity: 1, duration: 0.9, stagger: { each: 0.015 } },
        'text'
      )
      // CTA buttons after text
      .to(
        ctaRef.current ? Array.from(ctaRef.current.children) : [],
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 },
        '>-0.1'
      );
  }, []);

  const lines = useMemo(() => headline.split('\n'), [headline]);

  return (
    <div className="relative flex h-[52rem] w-full overflow-hidden bg-black/[0.96] antialiased md:items-center md:justify-center">
      {/* Grid Pattern Background */}
      <div
        className="pointer-events-none absolute inset-0 [background-size:40px_40px] select-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)',
        }}
      />

      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-48 md:pt-40 invisible"
      >
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="mb-2 last:mb-0">
              {line.split(' ').map((word, wIdx) => (
                <div
                  key={`${lineIdx}-${wIdx}`}
                  className="inline-block mr-2 last:mr-0 align-baseline overflow-hidden"
                >
                  {Array.from(word).map((ch, cIdx) => (
                    <span
                      key={`${lineIdx}-${wIdx}-${cIdx}`}
                      ref={registerChar}
                      className="inline-block will-change-transform bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent"
                      aria-hidden="true"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
          {subline.split(' ').map((word, wIdx) => (
            <span
              key={`sub-${wIdx}`}
              className="inline-block mr-1 overflow-hidden align-baseline"
            >
              {Array.from(word).map((ch, cIdx) => (
                <span
                  key={`sub-${wIdx}-${cIdx}`}
                  ref={registerSubChar}
                  className="inline-block will-change-transform"
                  aria-hidden="true"
                >
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </p>

        {/* CTA Buttons */}
        <motion.div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.01 }}
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="px-8 py-3 text-lg bg-white/90 text-black hover:bg-gray-200"
            >
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-black"
            >
              Sign In
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
