'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGoogle, FaMeta, FaShieldHalved } from 'react-icons/fa6';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const HealthcareHero = ({
  className = "min-h-[60vh] md:min-h-screen",
  prefixText = "Scaling your practice with",
  marketingWords = [
    "Google My Business", 
    "Search Console", 
    "Google Analytics", 
    "Yelp Business", 
    "Apple Business", 
    "Meta Ads", 
    "Google Ads"
  ]
}) => {
  const { theme } = useSitePreferences();
  const isDark = theme === 'dark';
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isVisibleRef = useRef(true);
  
  // Typing Effect State
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Intersection Observer for Performance (Pauses animation when off-screen)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 } // Triggers as soon as 1px is visible/hidden
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Typing Effect Logic
  useEffect(() => {
    // PERFORMANCE: Pause state updates when component is off-screen
    if (!isVisibleRef.current) return;

    const safeWordIndex = wordIndex % marketingWords.length;
    const currentWord = marketingWords[safeWordIndex];
    const typingSpeed = isDeleting ? 40 : 80; // Speed of typing and deleting
    
    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentWord) {
        // Pause at the end of the word before deleting
        setTimeout(() => setIsDeleting(true), 1800); 
      } else if (isDeleting && text === '') {
        // Move to the next word when fully deleted
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % marketingWords.length);
      } else {
        // Add or remove a character
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, text === currentWord && !isDeleting ? 1800 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, marketingWords]);

  // Canvas Animation Logic
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];
    let time = 0;

    const setSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', setSize);
    setSize();

    // Emerald brand colors (Marketing Growth & Healthcare)
    const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7'];

    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedX: number = 0;
      speedY: number = 0;
      color: string = '';
      type: 'cross' | 'dot' = 'dot';
      pingRadius: number = 0;
      isPinging: boolean = false;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = initial ? Math.random() * (canvas?.width || 0) : -50;
        this.y = Math.random() * (canvas?.height || 0);
        this.size = Math.random() * 2.5 + 1.5;
        this.speedX = Math.random() * 0.5 + 0.1; // Move right (forward momentum)
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // 30% chance to be a medical cross, otherwise a standard data node
        this.type = Math.random() > 0.7 ? 'cross' : 'dot';
        
        // Ping animation (represents a conversion/lead generation)
        this.pingRadius = 0;
        this.isPinging = Math.random() > 0.95; 
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Gentle wave motion
        this.y += Math.sin(time * 0.01 + this.x * 0.01) * 0.2;

        // Randomly trigger a conversion "ping"
        if (!this.isPinging && Math.random() < 0.001) {
          this.isPinging = true;
          this.pingRadius = this.size;
        }

        if (this.isPinging) {
          this.pingRadius += 0.5;
          if (this.pingRadius > 40) {
            this.isPinging = false;
            this.pingRadius = 0;
          }
        }

        // Recycle particles when they go off screen
        if (canvas && (this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50)) {
          this.reset();
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;

        if (this.type === 'dot') {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'cross') {
          const s = this.size * 1.5;
          ctx.fillRect(this.x - s, this.y - s/3, s*2, s/1.5); // horizontal
          ctx.fillRect(this.x - s/3, this.y - s, s/1.5, s*2); // vertical
        }

        // Draw conversion ping
        if (this.isPinging) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.pingRadius, 0, Math.PI * 2);
          ctx.strokeStyle = this.color;
          ctx.globalAlpha = 1 - (this.pingRadius / 40); // Fade out as it expands
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }
    }

    // Initialize network particles
    const particleCount = Math.min(window.innerWidth / 12, 100);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Draws an upward trending growth chart (Marketing Analytics)
    const drawGrowthChart = (offset: number, speed: number, heightMultiplier: number, opacity: number, color: string) => {
      if (!canvas) return;
      
      ctx.beginPath();
      
      // Start below the visible area
      ctx.moveTo(0, canvas.height);
      
      // We want the chart to generally trend UP from left to right
      let startY = canvas.height * 0.8;
      let endY = canvas.height * 0.2; 
      
      ctx.lineTo(0, startY);

      for (let x = 0; x <= canvas.width; x += 10) {
        // Calculate the base upward slope
        const progress = x / canvas.width;
        let baseTrend = startY - ((startY - endY) * progress);
        
        // Add smooth analytics-like waves on top of the trend
        const wave1 = Math.sin(x * 0.003 + time * speed + offset) * (40 * heightMultiplier);
        const wave2 = Math.cos(x * 0.007 + time * (speed * 1.5)) * (20 * heightMultiplier);
        
        ctx.lineTo(x, baseTrend + wave1 + wave2);
      }

      // Complete the shape to fill it
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      // Create gradient fill for the chart area
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.2, 0, canvas.height);
      gradient.addColorStop(0, `rgba(16, 185, 129, ${opacity})`); // Emerald
      gradient.addColorStop(1, 'rgba(248, 250, 252, 0)'); // Fades into background
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw the crisp top line of the chart
      ctx.beginPath();
      ctx.moveTo(0, startY);
      for (let x = 0; x <= canvas.width; x += 10) {
        const progress = x / canvas.width;
        let baseTrend = startY - ((startY - endY) * progress);
        const wave1 = Math.sin(x * 0.003 + time * speed + offset) * (40 * heightMultiplier);
        const wave2 = Math.cos(x * 0.007 + time * (speed * 1.5)) * (20 * heightMultiplier);
        ctx.lineTo(x, baseTrend + wave1 + wave2);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // PERFORMANCE OPTIMIZATION: Skip heavy canvas rendering when off-screen
      if (!isVisibleRef.current) return;

      time++;
      
      if (!canvas) return;

      // Clean background (--background: #f8fafc)
      ctx.fillStyle = '#f8fafc'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Marketing Growth / Analytics Trends in the background
      // Layer 1 (Slow, faint)
      drawGrowthChart(0, 0.005, 1.2, 0.05, 'rgba(110, 231, 183, 0.4)');
      // Layer 2 (Faster, main focus)
      drawGrowthChart(100, 0.008, 0.8, 0.08, 'rgba(16, 185, 129, 0.6)');

      // 2. Draw Patient Acquisition Network
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      // 3. Connect the targeting network
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes that are close to each other
          if (dist < 120) {
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 120)})`; 
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      // Note: requestAnimationFrame was moved to the top of the function
    };

    animate();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <header ref={containerRef} className={`relative overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Background Canvas (Pure Animation: Marketing Growth + Health Network) */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full block z-0 ${isDark ? 'opacity-40' : 'opacity-60'}`}
      />

      <div className="relative z-10 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full pointer-events-none"
            >
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                We market healthcare.<br className="break-word" />
                <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>Relentlessly.</span>
              </h1>
              
              <p className={`mt-6 text-lg sm:text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Premium digital marketing for ERs, MedSpas, and urgent care centers.
              </p>

              {/* Typing Animation - Large and Prominent */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`mt-12 mb-12 py-8 px-6 rounded-2xl backdrop-blur ${isDark ? 'bg-white/10 border border-white/20' : 'bg-slate-900/5 border border-slate-900/20'}`}
              >
                <p className={`text-base sm:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-3 font-medium`}>
                  {prefixText}
                </p>
                <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  <span className="inline-flex items-center justify-center min-h-[1.2em]">
                    {text}
                    {/* Blinking Cursor */}
                    <span className={`animate-pulse ml-2 opacity-70 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>|</span>
                  </span>
                </h2>
              </motion.div>

              {/* Trust Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pointer-events-auto mb-10"
              >
                <div className={`flex items-center gap-2 backdrop-blur px-4 py-2 rounded-full ${isDark ? 'bg-white/10 border border-white/20' : 'bg-slate-900/10 border border-slate-900/20'}`}>
                  <FaGoogle className="h-5 w-5 text-[#4285F4]" />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Google Partner</span>
                </div>
                <div className={`flex items-center gap-2 backdrop-blur px-4 py-2 rounded-full ${isDark ? 'bg-white/10 border border-white/20' : 'bg-slate-900/10 border border-slate-900/20'}`}>
                  <FaMeta className="h-5 w-5 text-[#0082FB]" />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Meta Certified</span>
                </div>
                <div className={`flex items-center gap-2 backdrop-blur px-4 py-2 rounded-full ${isDark ? 'bg-white/10 border border-white/20' : 'bg-slate-900/10 border border-slate-900/20'}`}>
                  <FaShieldHalved className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>HIPAA Aware</span>
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pointer-events-auto mb-12"
              >
                <Link 
                  href="/contact" 
                  className={`inline-flex items-center px-8 py-4 font-bold rounded-full transition-all hover:scale-105 shadow-lg ${isDark ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/30'}`}
                >
                  Get a free strategy call
                </Link>
                <Link 
                  href="/case-studies" 
                  className={`inline-flex items-center px-8 py-4 font-bold rounded-full transition-all border ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'}`}
                >
                  See our work
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
            >
              {[
                { value: '500+', label: 'Campaigns launched' },
                { value: '$10M+', label: 'Ad spend managed' },
                { value: '3×', label: 'Average ROI' },
              ].map((stat, idx) => (
                <div key={idx} className={`backdrop-blur rounded-2xl p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-900/5 border-slate-900/20'}`}>
                  <div className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>{stat.value}</div>
                  <div className={`mt-2 text-sm sm:text-base ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HealthcareHero;
