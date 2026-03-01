"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
// Logo image used instead of icons
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
  FaPinterest,
  FaSnapchat,
  FaReddit,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
} from 'react-icons/fa6';

const orbitIcons = [
  { Icon: FaFacebook, color: '#1877F2' },
  { Icon: FaInstagram, color: '#E4405F' },
  { Icon: FaXTwitter, color: '#000000' },
  { Icon: FaLinkedin, color: '#0A66C2' },
  { Icon: FaYoutube, color: '#FF0000' },
  { Icon: FaTiktok, color: '#25F4EE' },
  { Icon: FaPinterest, color: '#E60023' },
  { Icon: FaSnapchat, color: '#FFFC00' },
  { Icon: FaReddit, color: '#FF4500' },
  { Icon: FaWhatsapp, color: '#25D366' },
  { Icon: FaTelegram, color: '#24A1DE' },
  { Icon: FaDiscord, color: '#5865F2' },
];

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
    }, 1800);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950"
        >
          <div className="relative flex items-center justify-center w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[540px] md:h-[540px]">
            {/* Orbiting social icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ opacity: { duration: 0.4, delay: 0.3 }, rotate: { duration: 16, ease: 'linear', repeat: Infinity } }}
              className="absolute inset-0 pointer-events-none"
            >
              {orbitIcons.map(({ Icon, color }, idx) => {
                const angle = (idx * 360) / orbitIcons.length;
                const rad = (angle * Math.PI) / 180;
                // Position icons in a circle using percentage-based left/top
                const x = 50 + 44 * Math.sin(rad); // 44% radius
                const y = 50 - 44 * Math.cos(rad);
                const left = `${x.toFixed(3)}%`;
                const top = `${y.toFixed(3)}%`;
                return (
                  <div
                    key={`${color}-${idx}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left,
                      top,
                    }}
                  >
                    <div className="p-2 rounded-full bg-white/8 shadow-lg border border-white/10">
                      <Icon size={18} color={color} />
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Centered logo */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Glow behind logo */}
                <motion.div
                  className="absolute -inset-6 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)',
                    filter: 'blur(14px)',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.img
                  src="/Client-review-image/nextgen_footerlogo.png"
                  alt="NextGen Marketing Agency"
                  className="h-20 md:h-28 w-auto object-contain relative z-10"
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
