"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

type BotMood = "neutral" | "happy" | "sad" | "thinking";

interface AiAuthBotProps {
  mood?: BotMood;
  onMoodChange?: (mood: BotMood) => void;
}

const WELCOME_MESSAGES = [
  { text: "Welcome to Clarion AI", duration: 3000 },
  { text: "Your intelligent assistant for seamless support", duration: 3500 },
  { text: "Advanced AI-powered complaint resolution", duration: 3500 },
  { text: "Let's help resolve your concerns efficiently", duration: 3500 },
];

export function AiAuthBot({ mood = "neutral", onMoodChange }: AiAuthBotProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isBlinking, setIsBlinking] = useState(false);
  const botRef = useRef<HTMLDivElement>(null);
  const headControls = useAnimation();
  const messageIndex = useRef(0);

  // Random blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Track cursor movement for eye following
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate eye position based on cursor
  useEffect(() => {
    if (!botRef.current) return;

    const botRect = botRef.current.getBoundingClientRect();
    const botCenterX = botRect.left + botRect.width / 2;
    const botCenterY = botRect.top + botRect.height / 2;

    const deltaX = cursorPos.x - botCenterX;
    const deltaY = cursorPos.y - botCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Limit eye movement range
    const maxMove = 8;
    const normalizedX = (deltaX / distance) * Math.min(maxMove, distance / 30);
    const normalizedY = (deltaY / distance) * Math.min(maxMove, distance / 30);

    setEyePos({
      x: isNaN(normalizedX) ? 0 : normalizedX,
      y: isNaN(normalizedY) ? 0 : normalizedY,
    });
  }, [cursorPos]);

  // Show periodic messages
  useEffect(() => {
    const showMessageInterval = setInterval(() => {
      const message = WELCOME_MESSAGES[messageIndex.current];
      if (!message) return;
      setCurrentMessage(message.text);
      setShowMessage(true);

      setTimeout(() => {
        setShowMessage(false);
      }, message.duration);

      messageIndex.current = (messageIndex.current + 1) % WELCOME_MESSAGES.length;
    }, 8000);

    // Show first message after 2 seconds
    setTimeout(() => {
      const message = WELCOME_MESSAGES[0];
      if (!message) return;
      setCurrentMessage(message.text);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), message.duration);
    }, 2000);

    return () => clearInterval(showMessageInterval);
  }, []);

  // Notify parent of mood changes
  useEffect(() => {
    onMoodChange?.(mood);
  }, [mood, onMoodChange]);

  // Animate head shake on error
  useEffect(() => {
    if (mood === "sad") {
      headControls.start({
        rotate: [0, -15, 15, -15, 15, -10, 10, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      });
    } else if (mood === "happy") {
      headControls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.4, ease: "easeOut" },
      });
    }
  }, [mood, headControls]);

  // Eye shapes based on mood
  const getEyeShape = () => {
    switch (mood) {
      case "happy":
        return "M 8 12 Q 12 8 16 12"; // Curved up (happy eyes)
      case "sad":
        return "M 8 10 Q 12 14 16 10"; // Curved down (sad eyes)
      default:
        return null; // Circle eyes
    }
  };

  const isCurvedEyes = mood === "happy" || mood === "sad";

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block" ref={botRef}>
      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            key="speech-bubble"
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-full ml-6 top-0 w-56 pointer-events-none"
          >
            <div className="relative bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-lg border-2 border-indigo-200 dark:border-indigo-900/50">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{currentMessage}</p>
              {/* Speech bubble tail */}
              <div className="absolute right-full top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-indigo-200 dark:border-r-indigo-900/50" />
              <div className="absolute right-full top-6 ml-0.5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-slate-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot character */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="relative"
        style={{ width: "120px", height: "140px" }}
      >
        {/* Head wrapper - driven by headControls for shake/scale effects */}
        <motion.div animate={headControls} className="absolute inset-0">
        {/* Head - Claymorphism style */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-[32px] shadow-[0_8px_0_rgba(79,70,229,0.3),0_12px_24px_rgba(79,70,229,0.2)] border-4 border-indigo-500/30">
          {/* Face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Eyes container */}
            <div className="flex gap-6 mb-4">
              {/* Left eye */}
              <div className="relative w-6 h-6 bg-white rounded-full shadow-inner flex items-center justify-center overflow-hidden">
                {isBlinking && !isCurvedEyes ? (
                  <div className="w-full h-0.5 bg-slate-900" />
                ) : isCurvedEyes ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" className="absolute inset-0">
                    <path
                      d={getEyeShape() || ""}
                      stroke="#1E1B4B"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <motion.div
                    className="w-3 h-3 bg-slate-900 rounded-full"
                    animate={{
                      x: eyePos.x,
                      y: eyePos.y,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </div>

              {/* Right eye */}
              <div className="relative w-6 h-6 bg-white rounded-full shadow-inner flex items-center justify-center overflow-hidden">
                {isBlinking && !isCurvedEyes ? (
                  <div className="w-full h-0.5 bg-slate-900" />
                ) : isCurvedEyes ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" className="absolute inset-0">
                    <path
                      d={getEyeShape() || ""}
                      stroke="#1E1B4B"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <motion.div
                    className="w-3 h-3 bg-slate-900 rounded-full"
                    animate={{
                      x: eyePos.x,
                      y: eyePos.y,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </div>
            </div>

            {/* Mouth */}
            <svg width="40" height="24" viewBox="0 0 40 24" className="mt-1">
              {mood === "happy" && (
                <path
                  d="M 8 8 Q 20 20 32 8"
                  stroke="#1E1B4B"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {mood === "sad" && (
                <path
                  d="M 8 16 Q 20 4 32 16"
                  stroke="#1E1B4B"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {mood === "neutral" && (
                <line
                  x1="10"
                  y1="12"
                  x2="30"
                  y2="12"
                  stroke="#1E1B4B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              {mood === "thinking" && (
                <ellipse
                  cx="20"
                  cy="12"
                  rx="8"
                  ry="6"
                  stroke="#1E1B4B"
                  strokeWidth="2.5"
                  fill="none"
                />
              )}
            </svg>
          </div>

          {/* Antenna */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="w-1 h-6 bg-indigo-500" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-3 h-3 bg-orange-400 rounded-full shadow-lg mx-auto -mt-1"
            />
          </div>

          {/* Rosy cheeks */}
          {mood === "happy" && (
            <>
              <div className="absolute left-4 top-1/2 w-4 h-3 bg-pink-300/40 rounded-full blur-sm" />
              <div className="absolute right-4 top-1/2 w-4 h-3 bg-pink-300/40 rounded-full blur-sm" />
            </>
          )}
        </div>

        {/* Body */}
        </motion.div>
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-16 h-12 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-[20px] shadow-[0_6px_0_rgba(79,70,229,0.2)] border-3 border-indigo-400/30" />
      </motion.div>
    </div>
  );
}

// Hook to control bot from parent components
export function useAuthBot() {
  const [mood, setMood] = useState<BotMood>("neutral");

  const showSuccess = () => {
    setMood("happy");
    setTimeout(() => setMood("neutral"), 2000);
  };

  const showError = () => {
    setMood("sad");
    setTimeout(() => setMood("neutral"), 2000);
  };

  const showThinking = () => {
    setMood("thinking");
  };

  const reset = () => {
    setMood("neutral");
  };

  return { mood, showSuccess, showError, showThinking, reset };
}
