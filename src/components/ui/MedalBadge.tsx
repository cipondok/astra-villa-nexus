import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type MedalTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface MedalBadgeProps {
  tier: MedalTier;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const MEDAL_COLORS: Record<MedalTier, {
  primary: string;
  light: string;
  dark: string;
  ribbon: string;
  ribbonDark: string;
  sparkle: string;
  glow: string;
}> = {
  bronze: {
    primary: 'hsl(25, 50%, 60%)',
    light: 'hsl(25, 55%, 75%)',
    dark: 'hsl(25, 45%, 40%)',
    ribbon: 'hsl(0, 50%, 45%)',
    ribbonDark: 'hsl(0, 50%, 35%)',
    sparkle: 'hsl(25, 60%, 85%)',
    glow: 'hsl(25, 50%, 60%)',
  },
  silver: {
    primary: 'hsl(210, 10%, 75%)',
    light: 'hsl(210, 15%, 88%)',
    dark: 'hsl(210, 10%, 55%)',
    ribbon: 'hsl(185, 40%, 50%)',
    ribbonDark: 'hsl(185, 40%, 38%)',
    sparkle: 'hsl(210, 20%, 95%)',
    glow: 'hsl(210, 10%, 75%)',
  },
  gold: {
    primary: 'hsl(45, 90%, 55%)',
    light: 'hsl(45, 95%, 70%)',
    dark: 'hsl(40, 80%, 40%)',
    ribbon: 'hsl(25, 80%, 55%)',
    ribbonDark: 'hsl(25, 80%, 42%)',
    sparkle: 'hsl(45, 100%, 85%)',
    glow: 'hsl(45, 90%, 55%)',
  },
  platinum: {
    primary: 'hsl(200, 20%, 75%)',
    light: 'hsl(200, 25%, 88%)',
    dark: 'hsl(210, 25%, 55%)',
    ribbon: 'hsl(190, 70%, 55%)',
    ribbonDark: 'hsl(190, 70%, 40%)',
    sparkle: 'hsl(190, 80%, 85%)',
    glow: 'hsl(190, 70%, 55%)',
  },
  diamond: {
    primary: 'hsl(260, 60%, 65%)',
    light: 'hsl(260, 70%, 82%)',
    dark: 'hsl(260, 50%, 45%)',
    ribbon: 'hsl(280, 60%, 55%)',
    ribbonDark: 'hsl(280, 60%, 40%)',
    sparkle: 'hsl(260, 80%, 90%)',
    glow: 'hsl(260, 60%, 65%)',
  },
};

const SIZE_MAP = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 128,
};

const MedalBadge: React.FC<MedalBadgeProps> = ({
  tier,
  size = 'md',
  animate = true,
  className,
}) => {
  const colors = MEDAL_COLORS[tier];
  const px = SIZE_MAP[size];
  const isHexagon = tier === 'gold' || tier === 'platinum' || tier === 'diamond';

  const sparkleVariants = {
    initial: { opacity: 0.4, scale: 0.8 },
    animate: {
      opacity: [0.4, 1, 0.4],
      scale: [0.8, 1.1, 0.8],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  const Wrapper = animate ? motion.div : 'div' as any;
  const wrapperProps = animate
    ? { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 200, damping: 15 } }
    : {};

  return (
    <Wrapper {...wrapperProps} className={cn('inline-flex items-center justify-center', className)}>
      <svg
        width={px}
        height={px * 1.25}
        viewBox="0 0 100 125"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id={`medal-grad-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.light} />
            <stop offset="50%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.dark} />
          </linearGradient>
          <linearGradient id={`ribbon-grad-${tier}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.ribbon} />
            <stop offset="100%" stopColor={colors.ribbonDark} />
          </linearGradient>
          <radialGradient id={`shine-${tier}`} cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${tier}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ribbon tails */}
        <polygon
          points="38,88 50,100 44,88 50,75"
          fill={`url(#ribbon-grad-${tier})`}
        />
        <polygon
          points="62,88 50,100 56,88 50,75"
          fill={`url(#ribbon-grad-${tier})`}
          opacity="0.85"
        />

        {/* Main medal body */}
        {isHexagon ? (
          /* Hexagonal shield shape */
          <polygon
            points="50,8 88,28 88,68 50,88 12,68 12,28"
            fill={`url(#medal-grad-${tier})`}
            stroke={colors.dark}
            strokeWidth="2"
            filter={`url(#glow-${tier})`}
          />
        ) : (
          /* Circular medal shape */
          <circle
            cx="50"
            cy="48"
            r="38"
            fill={`url(#medal-grad-${tier})`}
            stroke={colors.dark}
            strokeWidth="2"
            filter={`url(#glow-${tier})`}
          />
        )}

        {/* Inner ring / inner hexagon */}
        {isHexagon ? (
          <polygon
            points="50,18 78,34 78,62 50,78 22,62 22,34"
            fill="none"
            stroke={colors.light}
            strokeWidth="1.5"
            opacity="0.6"
          />
        ) : (
          <circle
            cx="50"
            cy="48"
            r="28"
            fill="none"
            stroke={colors.light}
            strokeWidth="1.5"
            opacity="0.5"
          />
        )}

        {/* Star center */}
        <polygon
          points="50,25 55,40 70,40 58,50 62,65 50,56 38,65 42,50 30,40 45,40"
          fill={isHexagon ? colors.dark : colors.dark}
          opacity="0.35"
        />
        <polygon
          points="50,28 54,40 67,40 57,49 60,62 50,54 40,62 43,49 33,40 46,40"
          fill={colors.light}
          opacity="0.7"
        />

        {/* Shine overlay */}
        {isHexagon ? (
          <polygon
            points="50,8 88,28 88,68 50,88 12,68 12,28"
            fill={`url(#shine-${tier})`}
          />
        ) : (
          <circle
            cx="50"
            cy="48"
            r="38"
            fill={`url(#shine-${tier})`}
          />
        )}
      </svg>

      {/* Sparkle effects */}
      {animate && (
        <>
          <motion.svg
            variants={sparkleVariants}
            initial="initial"
            animate="animate"
            className="absolute"
            style={{ top: '10%', right: '5%' }}
            width={px * 0.18}
            height={px * 0.18}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5Z"
              fill={colors.sparkle}
            />
          </motion.svg>
          <motion.svg
            variants={sparkleVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '0.8s' }}
            className="absolute"
            {...{ style: { top: '25%', left: '5%' } }}
            width={px * 0.12}
            height={px * 0.12}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 2 L9 6 L14 8 L9 10 L8 14 L7 10 L2 8 L7 6Z"
              fill={colors.sparkle}
              opacity="0.7"
            />
          </motion.svg>
          <motion.svg
            variants={sparkleVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '1.4s' }}
            className="absolute"
            {...{ style: { bottom: '20%', right: '8%' } }}
            width={px * 0.1}
            height={px * 0.1}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 2 L9 6 L14 8 L9 10 L8 14 L7 10 L2 8 L7 6Z"
              fill={colors.sparkle}
              opacity="0.6"
            />
          </motion.svg>
        </>
      )}
    </Wrapper>
  );
};

export { MEDAL_COLORS };
export default MedalBadge;
