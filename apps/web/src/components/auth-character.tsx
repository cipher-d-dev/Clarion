"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export type AuthCharacterState = 'idle' | 'email' | 'password' | 'typing' | 'loading' | 'success' | 'error';

export interface AuthCharacterHandle {
  setState: (state: AuthCharacterState, message?: string) => void;
}

const IDLE_MESSAGES = [
  "Hi! I'm Clarion AI ✨",
  "I keep your data secure 🔒",
  "Every complaint matters here",
  "I'll guide you through this",
  "Your voice deserves to be heard",
  "Powered by AI, built with care",
];

const STATE_MESSAGES: Partial<Record<AuthCharacterState, string>> = {
  loading: "On it! Checking your credentials…",
  success: "You're in! Welcome back 🎉",
  error: "That's not quite right 🤔",
  password: "Your password is safe with me 🔒",
  email: "I'll find your account right away",
};

const AuthCharacter = forwardRef<AuthCharacterHandle>((_, ref) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [parallaxPos, setParallaxPos] = useState({ x: 0, y: 0 });
  const [eyesOpen, setEyesOpen] = useState(true);
  const [visorDown, setVisorDown] = useState(false);
  const [glowColor, setGlowColor] = useState('#6366f1');
  const [glowOpacity, setGlowOpacity] = useState(0.15);
  const [mouthPath, setMouthPath] = useState('M 152 190 Q 160 194 168 190');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(IDLE_MESSAGES[0]);
  const messageIndex = useRef(0);
  const stateFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleBlockedUntil = useRef(0);

  const headControls = useAnimation();
  const antennaControls = useAnimation();

  useEffect(() => {
    headControls.start({
      y: [-6, 0, -6],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
    });
    antennaControls.start({
      scale: [1, 1.4, 1],
      opacity: [1, 0.6, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    });
  }, [headControls, antennaControls]);

  useEffect(() => {
    const show = () => {
      if (Date.now() < idleBlockedUntil.current) return;
      setCurrentMessage(IDLE_MESSAGES[messageIndex.current]);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
      messageIndex.current = (messageIndex.current + 1) % IDLE_MESSAGES.length;
    };

    const t = setTimeout(show, 1500);
    const interval = setInterval(show, 8000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  const flashMessage = (msg: string, duration = 3500) => {
    if (stateFlashTimer.current) clearTimeout(stateFlashTimer.current);
    idleBlockedUntil.current = Date.now() + duration + 1000;
    setCurrentMessage(msg);
    setShowMessage(true);
    stateFlashTimer.current = setTimeout(() => setShowMessage(false), duration);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const svg = containerRef.current;
      const wrapper = wrapperRef.current;
      if (!svg || !wrapper) return;

      if (!visorDown) {
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.42;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        setPupilPos({ x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 });
      }

      const wrect = wrapper.getBoundingClientRect();
      setParallaxPos({
        x: ((e.clientX - wrect.left - wrect.width / 2) / wrect.width) * 14,
        y: ((e.clientY - wrect.top - wrect.height / 2) / wrect.height) * 10,
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [visorDown]);

  useImperativeHandle(ref, () => ({
    setState(state: AuthCharacterState, message?: string) {
      const msg = message ?? STATE_MESSAGES[state];
      if (msg) flashMessage(msg);

      if (state === 'email') {
        setEyesOpen(true); setVisorDown(false);
        setPupilPos({ x: 2, y: 0 });
        setMouthPath('M 152 190 Q 160 196 168 190');
      } else if (state === 'typing') {
        setEyesOpen(true); setVisorDown(false);
        setPupilPos({ x: 2, y: 0 });
        setMouthPath('M 152 190 Q 160 194 168 190');
      } else if (state === 'password') {
        setVisorDown(true); setEyesOpen(false);
        setPupilPos({ x: 0, y: 0 });
        setMouthPath('M 152 190 Q 160 188 168 190');
      } else if (state === 'loading') {
        setEyesOpen(true); setVisorDown(false); setIsSpinning(true);
        setMouthPath('M 152 189 Q 160 194 168 189');
      } else if (state === 'success') {
        setIsSpinning(false); setEyesOpen(true); setVisorDown(false);
        setGlowColor('#22c55e'); setGlowOpacity(0.25);
        setMouthPath('M 150 188 Q 160 198 170 188');
        setTimeout(() => { setGlowColor('#6366f1'); setGlowOpacity(0.15); }, 1000);
      } else if (state === 'error') {
        setIsSpinning(false); setVisorDown(false); setEyesOpen(true);
        setGlowColor('#ef4444'); setGlowOpacity(0.25);
        setMouthPath('M 152 193 Q 160 187 168 193');
        setTimeout(() => { setGlowColor('#6366f1'); setGlowOpacity(0.15); }, 1500);
      } else {
        // idle
        setIsSpinning(false); setVisorDown(false); setEyesOpen(true);
        setPupilPos({ x: 0, y: 0 });
        setMouthPath('M 152 190 Q 160 194 168 190');
        setGlowColor('#6366f1'); setGlowOpacity(0.15);
      }
    },
  }));

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Thought bubble — sits just above the bot's antenna */}
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.9 }}
        animate={{ opacity: showMessage ? 1 : 0, y: showMessage ? 0 : 4, scale: showMessage ? 1 : 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-52 pointer-events-none z-10"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="relative bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <p className="text-xs font-semibold text-white text-center leading-snug">{currentMessage}</p>
        </div>
        {/* Thought bubble dot chain pointing down to bot */}
        <div className="flex flex-col items-center gap-0.5 mt-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/15 border border-white/20" />
          <div className="w-1 h-1 rounded-full bg-white/10" />
        </div>
      </motion.div>

      <motion.div
        ref={wrapperRef}
        className="w-full h-full will-change-transform"
        animate={{ x: parallaxPos.x, y: parallaxPos.y }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <svg
          ref={containerRef}
          viewBox="80 60 160 220"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="headGrad" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#09090b" />
            </radialGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="eyeClipL">
              <rect x="136" y="162" width="18" height="18" rx="4" />
            </clipPath>
            <clipPath id="eyeClipR">
              <rect x="166" y="162" width="18" height="18" rx="4" />
            </clipPath>
            <clipPath id="visorClip">
              <rect x="128" y="155" width="64" height="32" rx="6" />
            </clipPath>
          </defs>

          <motion.ellipse
            cx="160" cy="195" rx="55" ry="40"
            fill={glowColor} opacity={glowOpacity}
            filter="url(#softGlow)"
            animate={{ fill: glowColor, opacity: glowOpacity }}
            transition={{ duration: 0.3 }}
          />

          <motion.g animate={headControls}>
            <rect x="152" y="220" width="16" height="14" rx="3" fill="#27272a" />
            <rect x="130" y="232" width="60" height="10" rx="5" fill="#1f1f23" />
            <rect x="120" y="140" width="80" height="86" rx="18"
              fill="url(#headGrad)" stroke="#3f3f46" strokeWidth="1.5" />
            <rect x="135" y="148" width="50" height="6" rx="3" fill="#3f3f46" opacity="0.7" />

            {/* Antenna */}
            <rect x="158" y="125" width="4" height="17" rx="2" fill="#3f3f46" />
            <motion.circle cx="160" cy="122" r="5" fill="#6366f1"
              filter="url(#softGlow)" animate={antennaControls} />

            {/* Eye sockets */}
            <rect x="134" y="160" width="22" height="22" rx="6" fill="#09090b" />
            <rect x="164" y="160" width="22" height="22" rx="6" fill="#09090b" />

            {/* Left eye */}
            <g clipPath="url(#eyeClipL)">
              <circle cx="145" cy="171" r="7" fill="#6366f1" opacity="0.9" />
              <motion.circle cx="145" cy="171" r="3.5" fill="#09090b"
                animate={{ x: pupilPos.x, y: pupilPos.y, rotate: isSpinning ? 360 : 0 }}
                transition={isSpinning
                  ? { rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }
                  : { duration: 0.3, ease: 'easeOut' }
                }
              />
              <circle cx="147" cy="169" r="1.2" fill="white" opacity="0.8" />
              {/* Eyelid: transformOrigin as Framer Motion prop (top edge = 162) */}
              <motion.rect
                x="136" y="162" width="18" height="18" fill="#09090b"
                transformOrigin="145px 162px"
                animate={{ scaleY: eyesOpen ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              />
            </g>

            {/* Right eye */}
            <g clipPath="url(#eyeClipR)">
              <circle cx="175" cy="171" r="7" fill="#6366f1" opacity="0.9" />
              <motion.circle cx="175" cy="171" r="3.5" fill="#09090b"
                animate={{ x: pupilPos.x, y: pupilPos.y, rotate: isSpinning ? 360 : 0 }}
                transition={isSpinning
                  ? { rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }
                  : { duration: 0.3, ease: 'easeOut' }
                }
              />
              <circle cx="177" cy="169" r="1.2" fill="white" opacity="0.8" />
              <motion.rect
                x="166" y="162" width="18" height="18" fill="#09090b"
                transformOrigin="175px 162px"
                animate={{ scaleY: eyesOpen ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              />
            </g>

            {/* Visor */}
            <motion.rect
              x="128" y="155" width="64" height="32" rx="6"
              fill="#1f1f23" stroke="#4f46e5" strokeWidth="1"
              transformOrigin="160px 155px"
              clipPath="url(#visorClip)"
              animate={{ scaleY: visorDown ? 1 : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />

            <motion.path
              d={mouthPath} stroke="#6366f1" strokeWidth="2.5"
              strokeLinecap="round" fill="none"
              animate={{ d: mouthPath }}
              transition={{ duration: 0.3 }}
            />

            <rect x="120" y="172" width="8" height="3" rx="1.5" fill="#4f46e5" opacity="0.6" />
            <rect x="192" y="172" width="8" height="3" rx="1.5" fill="#4f46e5" opacity="0.6" />
            <rect x="140" y="218" width="40" height="3" rx="1.5" fill="#4f46e5" opacity="0.3" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
});

AuthCharacter.displayName = 'AuthCharacter';
export default AuthCharacter;
