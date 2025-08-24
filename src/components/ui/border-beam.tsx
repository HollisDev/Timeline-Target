'use client';

import { cn } from '@/lib/utils';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  delay = 0,
  reverse = false,
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent bg-transparent',
        'bg-gradient-to-r',
        className,
      )}
      style={{
        maskImage: `radial-gradient(${size}px circle at var(--x) var(--y), white, transparent)`,
        animation: `border-beam ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
        animationDelay: `${delay}s`,
        '--x': '0px',
        '--y': '0px',
      } as React.CSSProperties}
    >
      <style jsx>{`
        @keyframes border-beam {
          0% {
            --x: 0px;
            --y: 0px;
          }
          25% {
            --x: 100%;
            --y: 0px;
          }
          50% {
            --x: 100%;
            --y: 100%;
          }
          75% {
            --x: 0px;
            --y: 100%;
          }
          100% {
            --x: 0px;
            --y: 0px;
          }
        }
      `}</style>
    </div>
  );
}
