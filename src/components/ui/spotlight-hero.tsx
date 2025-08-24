import { Button } from "@/components/ui/Button";
import { Spotlight } from "@/components/ui/spotlight";
import TextGenerateEffect from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SpotlightHero() {
  return (
    <div className="relative flex h-[52rem] w-full overflow-hidden bg-black/[0.96] antialiased md:items-center md:justify-center">
      {/* Grid Pattern Background */}
      <div
        className="pointer-events-none absolute inset-0 [background-size:40px_40px] select-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)'
        }}
      />

      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      
      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-48 md:pt-40">
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          <TextGenerateEffect 
            key="hero-typewriter"
            words={`Search Your Videos\nLike Never Before`}
            className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl"
          />
        </h1>
        <motion.p 
          className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
        >
          Upload videos, get instant transcriptions, and search through content with pinpoint accuracy. 
          Start with 8 free processing credits - no credit card required.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
        >
          <Link href="/signup">
            <Button size="lg" className="px-8 py-3 text-lg bg-white/90 text-black hover:bg-gray-200">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-black">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
