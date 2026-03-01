'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
  end: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

interface AnimatedStatProps {
  stat: StatItem;
  duration?: number;
}

function AnimatedStat({ stat, duration = 2 }: AnimatedStatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      setCount(Math.floor(progress * stat.end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, stat.end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="text-5xl font-black text-emerald-400 mb-2">
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <p className="text-slate-400">{stat.label}</p>
    </motion.div>
  );
}

export default function AnimatedStats() {
  const stats: StatItem[] = [
    { end: 47, label: 'Healthcare Clinics Helped', suffix: '+' },
    { end: 12000000, label: 'Total Client Revenue Driven', prefix: '$', suffix: '+' },
    { end: 210, label: 'Average ROI', suffix: '%' },
    { end: 500000, label: 'Patient Appointments Booked', suffix: '+' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, idx) => (
        <AnimatedStat key={idx} stat={stat} duration={2} />
      ))}
    </div>
  );
}
