'use client';

import Lottie from 'lottie-react';
import { useEffect, useRef } from 'react';
import animationData from '../../../public/assets/graphics/lottie-target-timeline-animation.json';

export default function HeroAnimation() {
  const lottieRef = useRef(null);

  useEffect(() => {
    // Optional: Control animation playback if needed
    if (lottieRef.current) {
      // Animation will auto-play by default
    }
  }, []);

  return (
    <div className="w-full max-w-[110rem] mx-auto">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={true}
        className="w-full h-auto scale-[1.8]"
      />
    </div>
  );
}
