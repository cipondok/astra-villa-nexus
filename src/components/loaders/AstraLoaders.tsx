/**
 * ASTRA Villa — Global Loading System
 * Branded luxury loaders replacing all default browser/spinner UIs.
 *
 * Exports:
 *  - AstraPageLoader        Full-screen branded loader (route + initial load)
 *  - AstraInlineLoader      Compact inline loader for Suspense fallbacks
 *  - PropertyCardSkeleton   Marketplace card placeholder
 *  - PropertyDetailSkeleton Property detail page placeholder
 *  - TableSkeleton          Generic table placeholder
 *  - ChartSkeleton          Chart/graph placeholder
 *  - DashboardSkeleton      Dashboard widget grid placeholder
 *  - ProfileSkeleton        User / vendor profile placeholder
 *  - AILoader               AI processing with rotating step messages
 *  - PropertySearchLoader   Search-results loading state
 *  - Tour3DLoader           3D / Virtual tour progress loader
 *  - NotificationLoader     Realtime notification sync loader
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/* -------------------------------------------------------------------------- */
/*  Rotating ASTRA brand messages                                             */
/* -------------------------------------------------------------------------- */
export const ASTRA_LOADING_MESSAGES = [
  'Loading Real Estate Intelligence...',
  'Connecting Property Ecosystem...',
  'Analyzing Investment Opportunities...',
  'Loading Property Intelligence Cloud...',
  'Preparing Smart Recommendations...',
  'Synchronizing Market Data...',
  'Loading ASEAN Property Network...',
  'Connecting Investors and Opportunities...',
];

function useRotatingMessage(messages: string[], intervalMs = 1800) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), intervalMs);
    return () => clearInterval(t);
  }, [messages, intervalMs]);
  return messages[i];
}

/* -------------------------------------------------------------------------- */
/*  Floating gold particles (decorative)                                      */
/* -------------------------------------------------------------------------- */
const Particles: React.FC<{ count?: number }> = ({ count = 12 }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <motion.span
        key={i}
        className="absolute h-1 w-1 rounded-full bg-[hsl(var(--gold-primary))]/40"
        style={{
          left: `${(i * 83) % 100}%`,
          top: `${(i * 47) % 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.1, 0.6, 0.1],
        }}
        transition={{
          duration: 4 + (i % 4),
          repeat: Infinity,
          delay: i * 0.2,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  ASTRA Logo Ring                                                           */
/* -------------------------------------------------------------------------- */
const AstraLogoRing: React.FC<{ size?: number }> = ({ size = 88 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <motion.div
      className="absolute inset-0 rounded-full border-2 border-transparent"
      style={{
        borderTopColor: 'hsl(var(--gold-primary))',
        borderRightColor: 'hsl(var(--gold-secondary))',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute inset-2 rounded-full border border-[hsl(var(--gold-primary))]/20"
      animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="bg-gradient-to-br from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-secondary))] bg-clip-text text-lg font-bold tracking-widest text-transparent">
        AV
      </span>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Full-screen branded loader                                                */
/* -------------------------------------------------------------------------- */
export interface AstraPageLoaderProps {
  message?: string;
  subMessage?: string;
  rotate?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export const AstraPageLoader: React.FC<AstraPageLoaderProps> = ({
  message,
  subMessage = 'Loading Real Estate Intelligence...',
  rotate = true,
  fullScreen = true,
  className,
}) => {
  const rotating = useRotatingMessage(ASTRA_LOADING_MESSAGES);
  const live = message ?? (rotate ? rotating : subMessage);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={live}
      className={cn(
        'relative flex flex-col items-center justify-center gap-6',
        fullScreen ? 'min-h-screen w-full' : 'min-h-[50vh] w-full py-12',
        'bg-background/80 backdrop-blur-xl',
        className,
      )}
    >
      <Particles />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative flex flex-col items-center gap-5 rounded-3xl border border-[hsl(var(--gold-primary))]/15 bg-background/60 px-10 py-9 shadow-[0_30px_80px_-30px_hsl(var(--gold-primary)/0.35)] backdrop-blur-2xl"
      >
        <AstraLogoRing />
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-[hsl(var(--gold-primary))] via-[hsl(var(--gold-secondary))] to-[hsl(var(--orange-primary))] bg-clip-text text-xl font-bold tracking-wide text-transparent">
            ASTRA Villa
          </h2>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Real Estate Operating System
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={live}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="max-w-xs text-center text-xs text-muted-foreground"
          >
            {live}
          </motion.p>
        </AnimatePresence>
        <div className="h-1 w-44 overflow-hidden rounded-full bg-muted/40">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--gold-primary))] via-[hsl(var(--gold-secondary))] to-[hsl(var(--orange-primary))]"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Compact inline loader for Suspense fallbacks                              */
/* -------------------------------------------------------------------------- */
export const AstraInlineLoader: React.FC<{ label?: string; className?: string }> = ({
  label = 'Loading...',
  className,
}) => (
  <div
    role="status"
    aria-live="polite"
    className={cn('flex min-h-[40vh] w-full items-center justify-center', className)}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3"
    >
      <AstraLogoRing size={56} />
      <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
    </motion.div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Skeletons                                                                 */
/* -------------------------------------------------------------------------- */
export const PropertyCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm',
      className,
    )}
  >
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-6 w-1/3" />
    </div>
  </div>
);

export const PropertyCardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ))}
  </div>
);

export const PropertyDetailSkeleton: React.FC = () => (
  <div className="space-y-6 p-4 md:p-6">
    <Skeleton className="h-[40vh] w-full rounded-2xl" />
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6,
  cols = 5,
}) => (
  <div className="overflow-hidden rounded-xl border border-border/40">
    <div className="grid gap-3 border-b border-border/40 bg-muted/30 p-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-3/4" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className="grid gap-3 border-b border-border/30 p-3 last:border-b-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 240 }) => (
  <div className="rounded-2xl border border-border/40 bg-card/60 p-4">
    <Skeleton className="mb-3 h-4 w-1/3" />
    <Skeleton className="mb-2 h-3 w-1/2" />
    <div className="relative mt-4" style={{ height }}>
      <Skeleton className="absolute inset-0 rounded-xl" />
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-4" style={{ height: `${20 + ((i * 13) % 70)}%` }} />
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-5 p-4 md:p-6">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card/60 p-4">
          <Skeleton className="mb-2 h-3 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
    <TableSkeleton />
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-5 p-4 md:p-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-40 rounded-2xl" />
  </div>
);

/* -------------------------------------------------------------------------- */
/*  AI Loader                                                                 */
/* -------------------------------------------------------------------------- */
export const AI_LOADING_STEPS = [
  'Analyzing Market Data...',
  'Calculating ROI...',
  'Evaluating Investment Potential...',
  'Generating Smart Recommendations...',
];

export const AILoader: React.FC<{ steps?: string[]; title?: string }> = ({
  steps = AI_LOADING_STEPS,
  title = 'ASTRA AI is thinking',
}) => {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 1400);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-[hsl(var(--gold-primary))]/20 bg-card/60 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <AstraLogoRing size={40} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-muted-foreground"
            >
              {steps[step]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-500',
              i <= step
                ? 'bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-secondary))]'
                : 'bg-muted/40',
            )}
          />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Property Search Loader                                                    */
/* -------------------------------------------------------------------------- */
export const PROPERTY_SEARCH_STEPS = [
  'Searching Properties...',
  'Scanning Property Database...',
  'Matching Investment Criteria...',
  'Preparing Results...',
];

export const PropertySearchLoader: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const msg = useRotatingMessage(PROPERTY_SEARCH_STEPS, 1300);
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label={msg}>
      <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--gold-primary))]/15 bg-card/40 px-4 py-3 backdrop-blur-md">
        <AstraLogoRing size={32} />
        <AnimatePresence mode="wait">
          <motion.span
            key={msg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            {msg}
          </motion.span>
        </AnimatePresence>
      </div>
      <PropertyCardSkeletonGrid count={count} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  3D / Virtual Tour Loader                                                  */
/* -------------------------------------------------------------------------- */
export const Tour3DLoader: React.FC<{ progress?: number; label?: string }> = ({
  progress,
  label = 'Loading Virtual Experience...',
}) => {
  const [internalProgress, setInternalProgress] = React.useState(0);
  React.useEffect(() => {
    if (progress != null) return;
    let raf: number;
    const tick = () => {
      setInternalProgress((p) => (p >= 95 ? 95 : p + Math.random() * 2));
      raf = window.setTimeout(tick, 180) as unknown as number;
    };
    tick();
    return () => clearTimeout(raf);
  }, [progress]);
  const pct = Math.round(progress ?? internalProgress);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="relative flex min-h-[50vh] flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-[hsl(var(--gold-primary))]/15 bg-background/60 backdrop-blur-xl"
    >
      <Particles count={18} />
      <AstraLogoRing size={72} />
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="h-1.5 w-64 overflow-hidden rounded-full bg-muted/40">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--gold-primary))] via-[hsl(var(--gold-secondary))] to-[hsl(var(--orange-primary))]"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Notification Loader                                                       */
/* -------------------------------------------------------------------------- */
export const NotificationLoader: React.FC = () => {
  const msg = useRotatingMessage(
    ['Loading Notifications...', 'Synchronizing Activity Feed...'],
    1400,
  );
  return (
    <div className="space-y-2 p-3" role="status" aria-live="polite" aria-label={msg}>
      <div className="flex items-center gap-2 px-1 pb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold-primary))]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        {msg}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AstraPageLoader;
