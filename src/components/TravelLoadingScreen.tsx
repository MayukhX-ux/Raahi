import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Globe, CompassIcon, Landmark, Plane, Sparkles } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

const TRAVEL_QUOTES = [
  {
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  },
  {
    text: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien"
  },
  {
    text: "Travel makes one modest. You see what a tiny place you occupy in the world.",
    author: "Gustave Flaubert"
  },
  {
    text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.",
    author: "Marcel Proust"
  },
  {
    text: "To travel is to live.",
    author: "Hans Christian Andersen"
  },
  {
    text: "We travel not to escape life, but for life not to escape us.",
    author: "Anonymous"
  },
  {
    text: "Life is either a daring adventure or nothing at all.",
    author: "Helen Keller"
  },
  {
    text: "Jobs fill your pockets, but adventures fill your soul.",
    author: "Jaime Lyn"
  },
  {
    text: "The world is a book and those who do not travel read only one page.",
    author: "Saint Augustine"
  },
  {
    text: "Travel is the only thing you buy that makes you richer.",
    author: "Anonymous"
  },
  {
    text: "Once a year, go someplace you’ve never been before.",
    author: "Dalai Lama"
  },
  {
    text: "A journey is best measured in friends, rather than miles.",
    author: "Tim Cahill"
  },
  {
    text: "Wanderlust: A strong desire to travel and explore the world.",
    author: "German Origin"
  },
  {
    text: "Adventure is worthwhile in itself.",
    author: "Amelia Earhart"
  },
  {
    text: "Travel is fatal to prejudice, bigotry, and narrow-mindedness.",
    author: "Mark Twain"
  }
];

const LOADING_STEPS = [
  "Securing your travel logs...",
  "Calibrating transit routes...",
  "Loading global maps...",
  "Polishing your journal pages...",
  "Ready for departure!"
];

interface TravelLoadingScreenProps {
  onComplete: () => void;
}

export default function TravelLoadingScreen({ onComplete }: TravelLoadingScreenProps) {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Pick a random quote
    const randomQuote = TRAVEL_QUOTES[Math.floor(Math.random() * TRAVEL_QUOTES.length)];
    setQuote(randomQuote);

    // Progress bar animation
    const duration = 3000; // 3 seconds
    const intervalTime = 30; // ms
    const steps = duration / intervalTime;
    let currentStepCount = 0;

    const timer = setInterval(() => {
      currentStepCount++;
      const currentProgress = Math.min((currentStepCount / steps) * 100, 100);
      setProgress(currentProgress);

      // Map progress to steps text
      const stepIndex = Math.min(
        Math.floor((currentProgress / 100) * LOADING_STEPS.length),
        LOADING_STEPS.length - 1
      );
      setCurrentStep(stepIndex);

      if (currentStepCount >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 300); // Small delay for ultra-smooth transition
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden select-none">
      {/* Background Particles */}
      <ParticleBackground />

      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-tr from-[#70b5f9]/10 to-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-br from-amber-500/5 to-rose-600/8 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col items-center relative z-10 text-center space-y-10">
        
        {/* Animated Compass Logo/Globe icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute w-24 h-24 rounded-full bg-[#70b5f9]/10 blur-xl animate-pulse" />
          <div className="relative p-5 bg-white/3 border border-white/8 rounded-full shadow-[0_0_30px_rgba(112,181,249,0.15)] flex items-center justify-center backdrop-blur-md">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            >
              <Compass className="h-10 w-10 text-[#70b5f9]" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-5 w-5 text-amber-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Quote Card */}
        <AnimatePresence mode="wait">
          {quote.text && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="px-6 py-8 md:px-12 md:py-10 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-lg shadow-2xl relative max-w-xl"
            >
              {/* Decorative Quotation Marks */}
              <span className="absolute -top-4 left-6 text-6xl text-white/5 font-serif select-none pointer-events-none">“</span>
              
              <p className="text-[#e1e1e1] text-base md:text-lg font-medium leading-relaxed tracking-wide font-sans italic relative z-10">
                "{quote.text}"
              </p>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-[1px] w-4 bg-[#70b5f9]/50" />
                <p className="text-xs font-bold text-[#70b5f9] tracking-widest uppercase">
                  {quote.author}
                </p>
                <span className="h-[1px] w-4 bg-[#70b5f9]/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Loading Step Text & Progress Bar */}
        <div className="w-full max-w-sm space-y-4">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02] relative shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-[#70b5f9] via-[#409bf6] to-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase">
            <motion.span
              key={currentStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#9fa3a7] font-semibold"
            >
              {LOADING_STEPS[currentStep]}
            </motion.span>
            <span className="text-[#70b5f9] font-black">{Math.round(progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
