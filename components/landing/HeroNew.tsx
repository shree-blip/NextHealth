'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
import { useSitePreferences } from '@/components/SitePreferencesProvider';

const socialRainIcons = [
  { Icon: FaFacebook, color: '#1877F2', left: '4%', delay: '-1.2s', duration: '24.5s', size: 20, sway: '18px' },
  { Icon: FaInstagram, color: '#E4405F', left: '9%', delay: '-3.1s', duration: '26.2s', size: 20, sway: '14px' },
  { Icon: FaXTwitter, color: '#000000', left: '14%', delay: '-2.4s', duration: '25.4s', size: 18, sway: '20px' },
  { Icon: FaLinkedin, color: '#0A66C2', left: '19%', delay: '-5.8s', duration: '27s', size: 20, sway: '16px' },
  { Icon: FaYoutube, color: '#FF0000', left: '24%', delay: '-4.2s', duration: '24.8s', size: 20, sway: '18px' },
  { Icon: FaTiktok, color: '#25F4EE', left: '29%', delay: '-6.5s', duration: '26.6s', size: 19, sway: '15px' },
  { Icon: FaPinterest, color: '#E60023', left: '34%', delay: '-0.7s', duration: '25.8s', size: 20, sway: '17px' },
  { Icon: FaSnapchat, color: '#FFFC00', left: '39%', delay: '-7.1s', duration: '27.4s', size: 20, sway: '14px' },
  { Icon: FaReddit, color: '#FF4500', left: '44%', delay: '-2.9s', duration: '25.2s', size: 20, sway: '21px' },
  { Icon: FaWhatsapp, color: '#25D366', left: '49%', delay: '-5.2s', duration: '26.4s', size: 20, sway: '13px' },
  { Icon: FaTelegram, color: '#24A1DE', left: '54%', delay: '-3.9s', duration: '24.9s', size: 20, sway: '19px' },
  { Icon: FaDiscord, color: '#5865F2', left: '59%', delay: '-6.2s', duration: '27.1s', size: 20, sway: '16px' },

  { Icon: FaFacebook, color: '#1877F2', left: '64%', delay: '-4.6s', duration: '25.7s', size: 20, sway: '12px' },
  { Icon: FaInstagram, color: '#E4405F', left: '68%', delay: '-1.9s', duration: '26.8s', size: 20, sway: '22px' },
  { Icon: FaXTwitter, color: '#000000', left: '72%', delay: '-7.5s', duration: '25.3s', size: 18, sway: '15px' },
  { Icon: FaLinkedin, color: '#0A66C2', left: '76%', delay: '-3.4s', duration: '27.2s', size: 20, sway: '19px' },
  { Icon: FaYoutube, color: '#FF0000', left: '80%', delay: '-5.9s', duration: '24.6s', size: 20, sway: '14px' },
  { Icon: FaTiktok, color: '#25F4EE', left: '84%', delay: '-2.2s', duration: '26.1s', size: 19, sway: '20px' },
  { Icon: FaPinterest, color: '#E60023', left: '88%', delay: '-8.1s', duration: '25.9s', size: 20, sway: '16px' },
  { Icon: FaSnapchat, color: '#FFFC00', left: '91%', delay: '-1.1s', duration: '27.6s', size: 20, sway: '23px' },
  { Icon: FaReddit, color: '#FF4500', left: '94%', delay: '-6.7s', duration: '26.7s', size: 20, sway: '11px' },
  { Icon: FaWhatsapp, color: '#25D366', left: '96%', delay: '-2.8s', duration: '25.1s', size: 20, sway: '18px' },
  { Icon: FaTelegram, color: '#24A1DE', left: '98%', delay: '-7.2s', duration: '26.5s', size: 20, sway: '13px' },
  { Icon: FaDiscord, color: '#5865F2', left: '99%', delay: '-4.3s', duration: '27.3s', size: 20, sway: '17px' },
];

export default function HeroNew() {
  const { t, theme } = useSitePreferences();
  const isDark = theme === 'dark';

  return (
    <header className={`relative overflow-visible py-24 lg:py-32 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Theme-aware gradient background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-800' : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50'}`} />

      {/* Social icon rain animation */}
      <div className="absolute inset-x-0 top-0 h-[420vh] z-30 pointer-events-none overflow-visible" aria-hidden="true">
        {socialRainIcons.map(({ Icon, color, left, delay, duration, size, sway }, idx) => (
          <div
            key={`${left}-${idx}`}
            className="social-rain-icon"
            style={{
              left,
              animationDelay: delay,
              animationDuration: duration,
              ['--brand-color' as any]: color,
              ['--sway-distance' as any]: sway,
            }}
          >
            <div className="social-rain-icon-inner">
              <Icon size={size} color={color} />
            </div>
          </div>
        ))}
      </div>

      <div className={`absolute inset-0 ${isDark ? 'bg-black/40' : 'bg-white/0'}`} />
      
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('We market healthcare.')}<br />
              <span className="text-emerald-400">{t('Relentlessly.')}</span>
            </h1>
            <p className={`mt-6 text-xl max-w-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('Premium digital marketing for ERs, MedSpas, and urgent care centers.')}
            </p>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className={`flex items-center gap-2 backdrop-blur px-4 py-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-900/10'}`}>
                <img src="/2.png" alt="Google Partner" className="h-6 w-6 object-contain" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Google Partner')}</span>
              </div>
              <div className={`flex items-center gap-2 backdrop-blur px-4 py-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-900/10'}`}>
                <img src="/3.png" alt="Meta Certified" className="h-6 w-6 object-contain" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Meta Certified')}</span>
              </div>
              <div className={`flex items-center gap-2 backdrop-blur px-4 py-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-900/10'}`}>
                <img src="/4.png" alt="HIPAA Aware" className="h-6 w-6 object-contain" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('HIPAA Aware')}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link 
                href="/contact" 
                className="inline-flex items-center px-8 py-4 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
              >
                {t('Get a free strategy call')}
              </Link>
              <Link 
                href="/case-studies" 
                className={`inline-flex items-center px-8 py-4 font-bold rounded-full transition-all border ${isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-300'}`}
              >
                {t('See our work')}
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src="/5.png" alt="Healthcare Marketing Dashboard" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { value: '500+', label: t('Campaigns launched') },
            { value: '$10M+', label: t('Ad spend managed') },
            { value: '3×', label: t('Average ROI') },
          ].map((stat, idx) => (
            <div key={idx} className={`backdrop-blur rounded-2xl p-6 text-center border ${isDark ? 'bg-white/10 border-white/10' : 'bg-slate-900/5 border-slate-900/20'}`}>
              <div className="text-4xl font-black text-emerald-400">{stat.value}</div>
              <div className={`mt-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .social-rain-icon {
          position: absolute;
          top: -12%;
          opacity: 0;
          animation-name: socialRainFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.25));
          will-change: transform, opacity;
          pointer-events: auto;
        }

        .social-rain-icon::after {
          content: '';
          position: absolute;
          left: 50%;
          top: -42px;
          transform: translateX(-50%);
          width: 2px;
          height: 36px;
          border-radius: 9999px;
          background: linear-gradient(to top, color-mix(in srgb, var(--brand-color) 70%, white 30%), transparent);
          opacity: 0.5;
          pointer-events: none;
        }

        .social-rain-icon-inner {
          transition: transform 220ms ease, filter 220ms ease;
          will-change: transform, filter;
          animation: socialIconFloat 2.2s ease-in-out infinite;
          background: color-mix(in srgb, var(--brand-color) 20%, transparent);
          border: 1px solid color-mix(in srgb, var(--brand-color) 45%, white 15%);
          border-radius: 9999px;
          padding: 8px;
          backdrop-filter: blur(3px);
        }

        .social-rain-icon:hover {
          animation-play-state: paused;
          z-index: 60;
        }

        .social-rain-icon:hover .social-rain-icon-inner {
          transform: scale(1.95) rotate(12deg);
          filter:
            drop-shadow(0 0 14px rgba(255, 255, 255, 0.75))
            drop-shadow(0 0 30px color-mix(in srgb, var(--brand-color) 75%, white 25%));
          animation: socialIconPulse 620ms ease-in-out infinite;
        }

        @keyframes socialRainFall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.55;
          }
          35% {
            transform: translate3d(calc(var(--sway-distance) * -1), 120vh, 0) rotate(130deg);
          }
          65% {
            transform: translate3d(var(--sway-distance), 230vh, 0) rotate(250deg);
          }
          90% {
            opacity: 0.55;
          }
          100% {
            transform: translate3d(0, 390vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes socialIconFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes socialIconPulse {
          0%,
          100% {
            transform: scale(1.95) rotate(12deg);
          }
          50% {
            transform: scale(2.12) rotate(8deg);
          }
        }

      `}</style>
    </header>
  );
}
