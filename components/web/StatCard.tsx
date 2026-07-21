'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  backgroundColor?: string;
  iconColor?: string;
}

function getCounterParts(value: string | number) {
  if (typeof value === 'number') {
    return {
      prefix: '',
      target: value,
      suffix: '',
    };
  }

  const match = value.trim().match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    target: Number(match[2]),
    suffix: match[3],
  };
}

function CounterValue({ value }: { value: string | number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const shouldReduceMotion = useReducedMotion();
  const counter = useMemo(() => getCounterParts(value), [value]);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!counter) {
      return;
    }

    if (shouldReduceMotion) {
      setDisplayValue(counter.target);
      return;
    }

    if (!isInView) {
      return;
    }

    let animationFrame = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animateValue = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(counter.target * easedProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateValue);
      }
    };

    animationFrame = requestAnimationFrame(animateValue);

    return () => cancelAnimationFrame(animationFrame);
  }, [counter, isInView, shouldReduceMotion]);

  if (!counter) {
    return (
      <p ref={ref} className="mt-1 text-4xl font-bold text-[#000000]">
        {value}
      </p>
    );
  }

  return (
    <p ref={ref} className="mt-1 text-4xl font-bold text-[#000000]">
      {counter.prefix}
      {displayValue}
      {counter.suffix}
    </p>
  );
}

export function StatCard({
  icon,
  label,
  value,
  backgroundColor = 'bg-cyan-50',
  iconColor = 'text-cyan-600',
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`${backgroundColor} flex items-start gap-4 rounded-lg p-6`}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`${iconColor} flex h-[64px] w-[64px] flex-shrink-0 items-center justify-center rounded-full bg-[#D9EAE8] text-3xl`}
      >
        {icon}
      </motion.div>
      <div className="flex-1">
        <p className="text-xl text-[#333333] font-medium">{label}</p>
        <CounterValue value={value} />
      </div>
    </motion.div>
  );
}
