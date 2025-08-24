'use client';

import { BorderBeam } from '@/components/ui/border-beam';
import HeroAnimation from './HeroAnimation';

export default function TimelineTarget() {
  return (
    <div className="flex justify-center mt-8 mb-16">
      <div 
        className="relative rounded-xl border-white/70 border-2 shadow-lg px-4 py-4 transition-all duration-300 bg-gradient-to-b from-white/[0.03] to-transparent bg-neutral-900/65 overflow-hidden"
        style={{
          boxShadow: '0 -20px 100px -20px rgba(255, 255, 255, 0.25) inset',
          width: '1600px',
          height: '500px'
        }}
      >
        <BorderBeam size={250} duration={15} delay={0} />
        <div className="flex justify-center items-center w-full h-full">
          <div className="w-full h-full flex justify-center items-center scale-75">
            <HeroAnimation />
          </div>
        </div>
      </div>
    </div>
  );
}
