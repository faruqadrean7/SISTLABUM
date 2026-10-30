'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// =========================================================================
// 1. FADE IN REVEAL (MUNCUL HALUS SAAT DI-SCROLL KE VIEWPORT)
// =========================================================================
interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: FadeInProps) {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 28 };
      case 'down':
        return { opacity: 0, y: -28 };
      case 'left':
        return { opacity: 0, x: 28 };
      case 'right':
        return { opacity: 0, x: -28 };
      case 'none':
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Cubic bezier elegan & mulus
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =========================================================================
// 2. STAGGER CONTAINER & ITEM (ANIMASI BERUNTUN UNTUK GRID / KARTU)
// =========================================================================
interface StaggerContainerProps {
  children: React.ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
  once?: boolean;
}

export function StaggerContainer({
  children,
  delayChildren = 0.05,
  staggerChildren = 0.12,
  className = '',
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  yOffset = 24,
}: {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =========================================================================
// 3. ANIMATED NUMBER COUNTER (ANGKA BERPUTAR NAIK SAAT TERLIHAT)
// =========================================================================
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1.8,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Easing out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toLocaleString('id-ID')}
      {suffix}
    </span>
  );
}

// =========================================================================
// 4. RUNNING MARQUEE TICKER (PITA TEKS BERJALAN KONTINU PERSIS SITUS KAMPUS KELAS DUNIA)
// =========================================================================
interface MarqueeTickerProps {
  items: string[];
  speed?: number; // detik per putaran
  className?: string;
}

export function MarqueeTicker({
  items,
  speed = 35,
  className = '',
}: MarqueeTickerProps) {
  return (
    <div className={`overflow-hidden select-none flex whitespace-nowrap ${className}`}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: speed,
        }}
        className="flex items-center shrink-0"
      >
        {/* Render item 2x untuk ilusi perulangan mulus tanpa jeda */}
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center">
            <span className="text-xs sm:text-sm font-semibold tracking-wide px-4">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C89332] inline-block shrink-0 opacity-80" aria-hidden="true" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

