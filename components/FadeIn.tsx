'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function FadeIn({ 
  children, 
  delay = 0, 
  className = "",
  direction = "up"
}: { 
  children: ReactNode, 
  delay?: number, 
  className?: string,
  direction?: "up" | "down" | "left" | "right" | "none"
}) {
  const getInitial = () => {
    switch(direction) {
      case "up": return { opacity: 0.7, y: 22 };
      case "down": return { opacity: 0.7, y: -22 };
      case "left": return { opacity: 0.7, x: 22 };
      case "right": return { opacity: 0.7, x: -22 };
      case "none": return { opacity: 0.82 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
