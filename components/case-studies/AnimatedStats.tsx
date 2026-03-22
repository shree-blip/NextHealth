'use client';
import { useRef, useEffect, useState } from 'react';

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
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isInView]);

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
    <div
      ref={ref}
      className="text-center transition-all duration-600"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <div className="text-5xl font-black text-white mb-2">
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <p className="text-emerald-100">{stat.label}</p>
    </div>
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
