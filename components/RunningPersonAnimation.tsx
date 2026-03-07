'use client';

/**
 * Lightweight CSS-only running person animation.
 * No external dependencies. Works in light & dark themes.
 * Uses SVG stick figure with CSS keyframe animations for limb motion.
 */
export default function RunningPersonAnimation({
  size = 48,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const id = 'runner'; // unique prefix for keyframes

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Running animation"
        role="img"
      >
        <style>{`
          @keyframes ${id}-head-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1.5px); }
          }
          @keyframes ${id}-torso {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-1px) rotate(2deg); }
            75% { transform: translateY(-1px) rotate(-2deg); }
          }
          @keyframes ${id}-left-arm {
            0% { transform: rotate(35deg); }
            50% { transform: rotate(-35deg); }
            100% { transform: rotate(35deg); }
          }
          @keyframes ${id}-right-arm {
            0% { transform: rotate(-35deg); }
            50% { transform: rotate(35deg); }
            100% { transform: rotate(-35deg); }
          }
          @keyframes ${id}-left-leg {
            0% { transform: rotate(40deg); }
            50% { transform: rotate(-30deg); }
            100% { transform: rotate(40deg); }
          }
          @keyframes ${id}-right-leg {
            0% { transform: rotate(-30deg); }
            50% { transform: rotate(40deg); }
            100% { transform: rotate(-30deg); }
          }
          @keyframes ${id}-left-shin {
            0% { transform: rotate(-50deg); }
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(-60deg); }
            75% { transform: rotate(-20deg); }
            100% { transform: rotate(-50deg); }
          }
          @keyframes ${id}-right-shin {
            0% { transform: rotate(-60deg); }
            25% { transform: rotate(-20deg); }
            50% { transform: rotate(-50deg); }
            75% { transform: rotate(-10deg); }
            100% { transform: rotate(-60deg); }
          }
          .${id}-head {
            animation: ${id}-head-bob 0.4s ease-in-out infinite;
            transform-origin: center;
          }
          .${id}-torso-g {
            animation: ${id}-torso 0.4s ease-in-out infinite;
            transform-origin: 32px 24px;
          }
          .${id}-left-arm {
            animation: ${id}-left-arm 0.4s ease-in-out infinite;
            transform-origin: 32px 26px;
          }
          .${id}-right-arm {
            animation: ${id}-right-arm 0.4s ease-in-out infinite;
            transform-origin: 32px 26px;
          }
          .${id}-left-leg {
            animation: ${id}-left-leg 0.4s ease-in-out infinite;
            transform-origin: 32px 38px;
          }
          .${id}-right-leg {
            animation: ${id}-right-leg 0.4s ease-in-out infinite;
            transform-origin: 32px 38px;
          }
          .${id}-left-shin {
            animation: ${id}-left-shin 0.4s ease-in-out infinite;
            transform-origin: top;
          }
          .${id}-right-shin {
            animation: ${id}-right-shin 0.4s ease-in-out infinite;
            transform-origin: top;
          }
        `}</style>

        {/* Head */}
        <circle
          className={`${id}-head`}
          cx="32"
          cy="14"
          r="5.5"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="none"
        />

        {/* Torso */}
        <g className={`${id}-torso-g`}>
          <line
            x1="32" y1="19.5" x2="32" y2="38"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* Left arm */}
        <g className={`${id}-left-arm`}>
          <line
            x1="32" y1="26" x2="24" y2="34"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Right arm */}
        <g className={`${id}-right-arm`}>
          <line
            x1="32" y1="26" x2="40" y2="34"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Left leg - thigh */}
        <g className={`${id}-left-leg`}>
          <line
            x1="32" y1="38" x2="26" y2="48"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Left leg - shin */}
          <g className={`${id}-left-shin`}>
            <line
              x1="26" y1="48" x2="24" y2="58"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Right leg - thigh */}
        <g className={`${id}-right-leg`}>
          <line
            x1="32" y1="38" x2="38" y2="48"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Right leg - shin */}
          <g className={`${id}-right-shin`}>
            <line
              x1="38" y1="48" x2="40" y2="58"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
