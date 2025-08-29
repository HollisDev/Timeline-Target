"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function TextGenerateEffect({
  words,
  className = "",
}: {
  words: string;
  className?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) =>
    words.slice(0, latest)
  );

  useEffect(() => {
    const controls = animate(count, words.length, {
      type: "tween",
      duration: 4.5, // Much slower - increased from 2.5 to 4.5 seconds
      ease: "easeInOut",
    });
    return controls.stop;
  }, [words, count]);

  return (
    <motion.span className={className} style={{ whiteSpace: 'pre-line' }}>
      {displayText}
    </motion.span>
  );
}
