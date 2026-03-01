"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Activity, Download } from 'lucide-react';
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
  const quotes = [
    "Growth is not an option, it's a mandate.",
    "Automate. Acquire. Accelerate.",
    "Marketing that actually moves the needle.",
    "Turning clicks into clinical visits."
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Show loader on every full-page load (includes refresh)
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

  useEffect(() => {
    const iv = setInterval(() => {
      setQuoteIndex(i => (i + 1) % quotes.length);
    }, 700);
    return () => clearInterval(iv);
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
          <div className="relative flex items-center justify-center w-[360px] h-[360px] md:w-[460px] md:h-[460px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ opacity: { duration: 0.4, delay: 0.3 }, rotate: { duration: 16, ease: 'linear', repeat: Infinity } }}
              className="absolute inset-0 pointer-events-none"
            >
              {orbitIcons.map(({ Icon, color }, idx) => {
                const angle = (idx * 360) / orbitIcons.length;
                return (
                  <div
                    key={`${color}-${idx}`}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-168px) rotate(-${angle}deg)`,
                    }}
                  >
                    <div className="p-2 rounded-full bg-white/8 shadow-lg border border-white/10">
                      <Icon size={18} color={color} />
                    </div>
                  </div>
                );
              })}
            </motion.div>

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-8 flex items-center gap-2"
              >
                <Activity className="h-16 w-16 text-emerald-500 animate-pulse" />
                <Download className="h-10 w-10 text-emerald-400 animate-pulse" />
              </motion.div>

              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                  className="text-4xl md:text-6xl font-bold text-white tracking-tighter text-center"
                >
                  NEXTGEN <span className="text-emerald-500">MARKETING</span>
                </motion.h1>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                className="h-px bg-emerald-500/50 mt-4 w-64"
              />
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
