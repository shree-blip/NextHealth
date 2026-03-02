'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  iconSize?: number;
  /** Use dark text for 'Nex' on light backgrounds. When false, 'Nex' is white. */
  darkText?: boolean;
  /** Compact mode for header - reduces text sizes */
  compact?: boolean;
}

export default function Logo({ className = '', showText = true, iconSize = 100, darkText = false, compact = false }: LogoProps) {
  return (
    <>
      <style>{`
        .nexhealth-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 25px;
          text-decoration: none;
          cursor: pointer;
        }

        .nexhealth-logo-icon {
          filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.2));
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nexhealth-logo-wrapper:hover .nexhealth-logo-icon {
          transform: scale(1.08);
        }

        .nexhealth-brand-name {
          font-size: 4rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -2px;
          margin-bottom: 5px;
          display: flex;
        }

        .nexhealth-logo-wrapper.compact .nexhealth-brand-name {
          font-size: 1.75rem;
        }

        .nexhealth-logo-wrapper.compact .nexhealth-brand-tagline {
          font-size: 0.6rem;
          letter-spacing: 4px;
        }

        .nexhealth-brand-name .nex-dark {
          color: #0f172a;
        }

        .nexhealth-brand-name .nex-light {
          color: #ffffff;
        }

        .nexhealth-brand-name .health {
          background: linear-gradient(to right, #10b981 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }

        .nexhealth-brand-tagline {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 7px;
          color: #64748b;
          text-transform: uppercase;
        }

        @keyframes nexhealth-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .nexhealth-float-anim {
          animation: nexhealth-float 6s ease-in-out infinite;
        }

        @keyframes nexhealth-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .nexhealth-spin-cross {
          transform-origin: 100px 100px;
          animation: nexhealth-spin-slow 20s linear infinite;
        }

        @media (max-width: 768px) {
          .nexhealth-logo-wrapper {
            flex-direction: row;
            gap: 12px;
            align-items: center;
          }
          .nexhealth-brand-name { font-size: 1.5rem; justify-content: flex-start; }
          .nexhealth-brand-tagline { letter-spacing: 2px; font-size: 0.5rem; }
        }
      `}</style>

      <Link
        href="/"
        className={`nexhealth-logo-wrapper ${compact ? 'compact' : ''} ${className}`}
        aria-label="Go to NexHealth Homepage"
        title="NexHealth Homepage"
      >
        <svg
          className="nexhealth-logo-icon nexhealth-float-anim"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: iconSize, height: iconSize }}
        >
          <defs>
            <linearGradient id="growth-gradient" x1="100" y1="15" x2="100" y2="185" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="growth-gradient-h" x1="15" y1="100" x2="185" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433"/>
              <stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/>
              <stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient>

            <path id="orbit-path" d="M 25 100 a 75 30 0 1 0 150 0 a 75 30 0 1 0 -150 0" />
          </defs>

          {/* Glowing background ring */}
          <circle cx="100" cy="100" r="85" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="2"/>

          {/* 5 Orbital Rings */}
          <use href="#orbit-path" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" transform="rotate(0 100 100)" />
          <use href="#orbit-path" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" transform="rotate(36 100 100)" />
          <use href="#orbit-path" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" transform="rotate(72 100 100)" />
          <use href="#orbit-path" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" transform="rotate(108 100 100)" />
          <use href="#orbit-path" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" transform="rotate(144 100 100)" />

          {/* 1. Google (Orbit 0 deg) */}
          <g transform="rotate(0 100 100)">
            <g>
              <animateMotion dur="10s" repeatCount="indefinite">
                <mpath href="#orbit-path" />
              </animateMotion>
              <g transform="rotate(0)">
                <circle cx="0" cy="0" r="16" fill="#ffffff" filter="drop-shadow(0 0 4px rgba(0,0,0,0.1))"/>
                <g transform="scale(0.95)">
                  <path d="M8.6,0 c0,-0.6 -0.1,-1.1 -0.2,-1.7 H0 v3.2 h4.9 c-0.2,1.1 -0.8,2 -1.7,2.6 v2.2 h2.8 C7.6,4.7 8.6,2.5 8.6,0 z" fill="#4285F4"/>
                  <path d="M0,8.8 c2.4,0 4.5,-0.8 5.9,-2.2 L3.2,4.4 C2.4,4.9 1.3,5.2 0,5.2 c-2.4,0 -4.5,-1.6 -5.2,-3.8 h-2.9 v2.3 C-5.3,7.2 -2.9,8.8 0,8.8 z" fill="#34A853"/>
                  <path d="M-5.2,1.4 c-0.2,-0.6 -0.3,-1.2 -0.3,-1.8 c0,-0.6 0.1,-1.2 0.3,-1.8 v-2.3 h-2.9 C-8.8,-3 -9.1,-1.5 -9.1,0 c0,1.5 0.3,3 0.9,4.3 L-5.2,1.4 z" fill="#FBBC05"/>
                  <path d="M0,-5.2 c1.3,0 2.5,0.4 3.4,1.3 l2.6,-2.6 C4.5,-8 2.4,-8.8 0,-8.8 c-2.9,0 -5.3,1.6 -6.8,4.1 l2.9,2.3 C-4.5,-3.6 -2.4,-5.2 0,-5.2 z" fill="#EA4335"/>
                </g>
              </g>
            </g>
          </g>

          {/* 2. Bing (Orbit 36 deg) */}
          <g transform="rotate(36 100 100)">
            <g>
              <animateMotion dur="13s" repeatCount="indefinite">
                <mpath href="#orbit-path" />
              </animateMotion>
              <g transform="rotate(-36)">
                <circle cx="0" cy="0" r="16" fill="#008373"/>
                <path d="M-3,-6 L-3,6 L2.5,3 L2.5,-3 L0,-1 L0,1.5 L-1.5,0.5 L-1.5,-5 Z" fill="#ffffff" transform="scale(1.4) translate(0, 0)"/>
              </g>
            </g>
          </g>

          {/* 3. Facebook (Orbit 72 deg) */}
          <g transform="rotate(72 100 100)">
            <g>
              <animateMotion dur="16s" repeatCount="indefinite">
                <mpath href="#orbit-path" />
              </animateMotion>
              <g transform="rotate(-72)">
                <circle cx="0" cy="0" r="16" fill="#1877F2"/>
                <path d="M2.5 -5 h-2 a2.5 2.5 0 0 0 -2.5 2.5 v2 h-2 v3 h2 v6 h3 v-6 h2.5 l0.5 -3 h-3 v-1.5 a0.5 0.5 0 0 1 0.5 -0.5 h2 z" fill="#ffffff" transform="scale(1.1) translate(-0.5, 0)"/>
              </g>
            </g>
          </g>

          {/* 4. Yelp (Orbit 108 deg) */}
          <g transform="rotate(108 100 100)">
            <g>
              <animateMotion dur="19s" repeatCount="indefinite">
                <mpath href="#orbit-path" />
              </animateMotion>
              <g transform="rotate(-108)">
                <circle cx="0" cy="0" r="16" fill="#FF1A1A"/>
                <g fill="#ffffff" transform="scale(1.1)">
                  <path d="M-1,-1.5 L-2,-6.5 A1.5 1.5 0 0 1 2,-6.5 L1,-1.5 Z" />
                  <path d="M1.5,-0.5 L6.5,-2 A1.5 1.5 0 0 1 6.5,2 L1.5,0.5 Z" />
                  <path d="M0.5,1.5 L4,6 A1.5 1.5 0 0 1 0.5,7.5 L-0.5,1.5 Z" />
                  <path d="M-0.5,1.5 L-4,6 A1.5 1.5 0 0 1 -7.5,3 L-1.5,0.5 Z" />
                  <path d="M-1.5,0 L-6.5,-1.5 A1.5 1.5 0 0 1 -5,-5 L-1,-1 Z" />
                </g>
              </g>
            </g>
          </g>

          {/* 5. Instagram (Orbit 144 deg) */}
          <g transform="rotate(144 100 100)">
            <g>
              <animateMotion dur="14.5s" repeatCount="indefinite">
                <mpath href="#orbit-path" />
              </animateMotion>
              <g transform="rotate(-144)">
                <circle cx="0" cy="0" r="16" fill="url(#ig-gradient)"/>
                <rect x="-9" y="-9" width="18" height="18" rx="5" fill="none" stroke="#ffffff" strokeWidth="2.5"/>
                <circle cx="0" cy="0" r="4.5" fill="none" stroke="#ffffff" strokeWidth="2.5"/>
                <circle cx="5" cy="-5" r="1.5" fill="#ffffff"/>
              </g>
            </g>
          </g>

          {/* Rotating Medical Plus Sign (Nucleus) */}
          <g className="nexhealth-spin-cross">
            {/* Vertical bar - uses vertical gradient */}
            <rect x="72" y="15" width="56" height="170" rx="28" fill="url(#growth-gradient)" opacity="1" />
            {/* Horizontal bar - uses horizontal gradient */}
            <rect x="15" y="72" width="170" height="56" rx="28" fill="url(#growth-gradient-h)" opacity="1" />
          </g>
        </svg>

        {showText && (
          <div className="nexhealth-logo-text-wrapper">
            <div className="nexhealth-brand-name" style={{ margin: 0 }}>
              <span className={darkText ? 'nex-dark' : 'nex-light'}>Nex</span>
              <span className="health">Health</span>
            </div>
            <div className="nexhealth-brand-tagline">Healthcare Marketing</div>
          </div>
        )}
      </Link>
    </>
  );
}
