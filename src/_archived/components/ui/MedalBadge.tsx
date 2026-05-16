import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type MedalTier = 'silver' | 'gold' | 'platinum' | 'diamond';

interface MedalBadgeProps {
  tier: MedalTier;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

/**
 * Google Play Store inspired badge colours per tier.
 */
const MEDAL_COLORS: Record<MedalTier, {
  primary: string;
  light: string;
  dark: string;
  accent: string;
  sparkle: string;
  label: string;
}> = {
  silver: {
    primary: '#A8B2BD',
    light: '#CDD5DD',
    dark: '#6B7B8D',
    accent: '#D6DDE4',
    sparkle: '#E8EDF2',
    label: 'Silver',
  },
  gold: {
    primary: '#F5C842',
    light: '#FFE082',
    dark: '#C49B1A',
    accent: '#FFEB7A',
    sparkle: '#FFF8DC',
    label: 'Gold',
  },
  platinum: {
    primary: '#4FC3F7',
    light: '#B3E5FC',
    dark: '#0277BD',
    accent: '#81D4FA',
    sparkle: '#E1F5FE',
    label: 'Platinum',
  },
  diamond: {
    primary: '#B388FF',
    light: '#E1BEE7',
    dark: '#7C4DFF',
    accent: '#CE93D8',
    sparkle: '#F3E5F5',
    label: 'Diamond',
  },
};

const SIZE_MAP = {
  sm: 28,
  md: 44,
  lg: 64,
  xl: 88,
};

/**
 * Google Play Store style badge — clean shield shape with layered gradients,
 * inner play-button motif and subtle sparkle animations.
 */
const MedalBadge: React.FC<MedalBadgeProps> = ({
  tier,
  size = 'md',
  animate = true,
  className,
}) => {
  const c = MEDAL_COLORS[tier];
  const px = SIZE_MAP[size];
  const uid = `gps-${tier}-${size}`;

  const Wrapper = animate ? motion.div : ('div' as any);
  const wrapperProps = animate
    ? {
        initial: { scale: 0.85, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', stiffness: 260, damping: 18 },
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn('inline-flex items-center justify-center relative', className)}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <defs>
          {/* Main body gradient */}
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={c.light} />
            <stop offset="45%" stopColor={c.primary} />
            <stop offset="100%" stopColor={c.dark} />
          </linearGradient>

          {/* Highlight shine */}
          <linearGradient id={`hi-${uid}`} x1="20" y1="0" x2="55" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Inner ring gradient */}
          <linearGradient id={`ring-${uid}`} x1="0" y1="15" x2="80" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={c.accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c.dark} stopOpacity="0.5" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id={`ds-${uid}`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={c.dark} floodOpacity="0.35" />
          </filter>
        </defs>

        {/* ── Shield shape (Google Play Store rounded-bottom style) ── */}
        <path
          d="M40 4 C18 4, 6 14, 6 30 L6 44 C6 60, 20 76, 40 76 C60 76, 74 60, 74 44 L74 30 C74 14, 62 4, 40 4Z"
          fill={`url(#bg-${uid})`}
          filter={`url(#ds-${uid})`}
        />

        {/* Outer border highlight */}
        <path
          d="M40 4 C18 4, 6 14, 6 30 L6 44 C6 60, 20 76, 40 76 C60 76, 74 60, 74 44 L74 30 C74 14, 62 4, 40 4Z"
          fill="none"
          stroke={c.accent}
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Inner circle / ring */}
        <circle cx="40" cy="38" r="22" fill="none" stroke={`url(#ring-${uid})`} strokeWidth="2" opacity="0.7" />
        <circle cx="40" cy="38" r="18" fill={c.dark} opacity="0.12" />

        {/* Center icon — play-triangle for Play Store feel */}
        {tier === 'diamond' ? (
          /* Diamond shape in center */
          <polygon
            points="40,20 54,38 40,56 26,38"
            fill={c.accent}
            opacity="0.85"
            stroke={c.light}
            strokeWidth="1"
          />
        ) : tier === 'platinum' ? (
          /* Star for platinum */
          <polygon
            points="40,22 44,32 55,33 47,40 49,51 40,46 31,51 33,40 25,33 36,32"
            fill={c.accent}
            opacity="0.85"
          />
        ) : tier === 'gold' ? (
          /* Crown for gold */
          <path
            d="M27,46 L27,34 L33,40 L40,28 L47,40 L53,34 L53,46Z"
            fill={c.accent}
            opacity="0.9"
            stroke={c.dark}
            strokeWidth="0.8"
          />
        ) : (
          /* Check mark for silver */
          <path
            d="M30,38 L37,46 L52,30"
            fill="none"
            stroke={c.accent}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        )}

        {/* Shine overlay */}
        <path
          d="M40 4 C18 4, 6 14, 6 30 L6 44 C6 60, 20 76, 40 76 C60 76, 74 60, 74 44 L74 30 C74 14, 62 4, 40 4Z"
          fill={`url(#hi-${uid})`}
        />

        {/* Bottom tier label */}
        <text
          x="40"
          y="68"
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fill={c.dark}
          opacity="0.7"
          fontFamily="system-ui, sans-serif"
        >
          {c.label.toUpperCase()}
        </text>
      </svg>

      {/* Sparkle animations */}
      {animate && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: px * 0.08,
              height: px * 0.08,
              background: c.sparkle,
              top: '12%',
              right: '10%',
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.7, 1.3, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: px * 0.06,
              height: px * 0.06,
              background: c.sparkle,
              top: '28%',
              left: '8%',
            }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </>
      )}
    </Wrapper>
  );
};

export { MEDAL_COLORS };
export default MedalBadge;
