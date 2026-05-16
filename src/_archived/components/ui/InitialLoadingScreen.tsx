import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_PLACEHOLDER, useWelcomeScreenLogo } from '@/hooks/useBrandingLogo';
import welcomeBg from '@/assets/welcome-bg.jpg';
import { Building2, MapPin, Key, TrendingUp, Home, Sparkles } from 'lucide-react';

const PROPERTY_ICONS = [Building2, MapPin, Key, TrendingUp, Home, Sparkles];

const InitialLoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const { logoUrl: batchedLogoUrl, isLoading: isLogoLoading } = useWelcomeScreenLogo();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLogoLoading && batchedLogoUrl) setLogoUrl(batchedLogoUrl);
  }, [batchedLogoUrl, isLogoLoading]);

  useEffect(() => {
    const timeout = setTimeout(() => setLogoUrl(prev => prev ?? LOGO_PLACEHOLDER), 1500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const stages = [
      { progress: 20, text: 'Discovering properties...' },
      { progress: 40, text: 'Loading luxury listings...' },
      { progress: 60, text: 'Preparing your experience...' },
      { progress: 80, text: 'Almost ready...' },
      { progress: 100, text: 'Welcome to ASTRA!' }
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < stages.length) {
        setProgress(stages[i].progress);
        setLoadingText(stages[i].text);
        i++;
      } else clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Stable random positions for floating icons
  const iconPositions = useMemo(() => 
    PROPERTY_ICONS.map((_, i) => ({
      left: `${10 + i * 15}%`,
      top: `${15 + (i % 3) * 30}%`,
      delay: i * 0.4,
    })), []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      >
        {/* Full-screen property background image */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        >
          <img 
            src={welcomeBg} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient overlays for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(0, 153, 230, 0.15) 0%, transparent 60%)',
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Animated teal/gold accent glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 70%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating property icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PROPERTY_ICONS.map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: iconPositions[i].left, top: iconPositions[i].top }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: [0, 0.25, 0],
                y: [20, -15, 20],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: iconPositions[i].delay,
                ease: 'easeInOut'
              }}
            >
              <Icon className="w-6 h-6 md:w-8 md:h-8 text-white/30" />
            </motion.div>
          ))}
        </div>

        {/* Sparkle particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-white/60"
              style={{
                left: `${5 + (i * 6.3) % 90}%`,
                top: `${8 + (i * 7.1) % 85}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2.5 + (i % 3),
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center px-6">
          
          {/* Logo with animated rings */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="relative mb-8"
          >
            {/* Outer dashed ring */}
            <motion.div
              className="absolute -inset-10 rounded-full border-2 border-dashed"
              style={{ borderColor: 'rgba(212, 175, 55, 0.25)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            {/* Conic gradient ring */}
            <motion.div
              className="absolute -inset-7 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, rgba(0, 153, 230, 0.4), transparent 40%, rgba(212, 175, 55, 0.4), transparent 80%)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />

            {/* Pulsing glow ring */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{ border: '1.5px solid rgba(0, 153, 230, 0.4)' }}
              animate={{ 
                scale: [1, 1.08, 1],
                opacity: [0.4, 0.8, 0.4],
                boxShadow: [
                  '0 0 15px rgba(0, 153, 230, 0.2)',
                  '0 0 35px rgba(0, 153, 230, 0.5)',
                  '0 0 15px rgba(0, 153, 230, 0.2)',
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Logo container with glassmorphic effect */}
            <motion.div
              className="relative w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 153, 230, 0.9) 0%, rgba(0, 80, 140, 0.95) 100%)',
                boxShadow: '0 0 60px rgba(0, 153, 230, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
              animate={{
                boxShadow: [
                  '0 0 60px rgba(0, 153, 230, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)',
                  '0 0 90px rgba(0, 153, 230, 0.6), 0 20px 60px rgba(0, 0, 0, 0.4)',
                  '0 0 60px rgba(0, 153, 230, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {logoUrl && (
                <motion.img 
                  src={logoUrl} 
                  alt="ASTRA Villa Logo" 
                  className="w-18 h-18 md:w-20 md:h-20 object-contain drop-shadow-lg"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = LOGO_PLACEHOLDER;
                  }}
                />
              )}
            </motion.div>
          </motion.div>

          {/* Brand name with colorful gradient */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">
              <motion.span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #0099e6 0%, #00d4ff 30%, #d4af37 60%, #f0d060 100%)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              >
                ASTRA
              </motion.span>
              <span className="text-white/90 ml-3 drop-shadow-lg">Villa</span>
            </h1>
            
            {/* Tagline with elegant separators */}
            <motion.div 
              className="flex items-center justify-center gap-4 mt-2"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div 
                className="h-px w-10 md:w-16"
                style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-white/70 text-[10px] md:text-xs tracking-[0.4em] uppercase font-medium">
                Premium Real Estate Platform
              </p>
              <motion.div 
                className="h-px w-10 md:w-16"
                style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-white/50 text-[10px] md:text-xs mt-3 tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Indonesia's First AI-Powered Property Platform
            </motion.p>
          </motion.div>

          {/* Progress section with glassmorphic card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="w-72 md:w-96 rounded-2xl p-5 md:p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {/* Progress bar */}
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              {/* Glow behind fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #0099e6, #00d4ff, #d4af37)',
                  filter: 'blur(4px)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              {/* Main fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #0099e6, #00d4ff, #d4af37, #0099e6)',
                  backgroundSize: '300% 100%',
                }}
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${progress}%`,
                  backgroundPosition: ['0% 50%', '100% 50%']
                }}
                transition={{ 
                  width: { duration: 0.5, ease: 'easeOut' },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                }}
              />
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                  width: '25%'
                }}
                animate={{ x: ['-100%', '500%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Text & percentage */}
            <div className="flex items-center justify-between mt-3">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={loadingText}
                  className="text-white/60 text-xs font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  {loadingText}
                </motion.span>
              </AnimatePresence>
              <motion.span 
                className="text-sm font-bold tabular-nums"
                style={{ color: '#00d4ff' }}
                animate={{ 
                  textShadow: ['0 0 8px rgba(0, 212, 255, 0)', '0 0 12px rgba(0, 212, 255, 0.6)', '0 0 8px rgba(0, 212, 255, 0)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {progress}%
              </motion.span>
            </div>
          </motion.div>

          {/* Bouncing dots */}
          <motion.div 
            className="flex items-center gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: i < 2 ? '#0099e6' : i < 4 ? '#00d4ff' : '#d4af37',
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.7, 1.3, 0.7]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Bottom decorative line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, transparent 5%, #0099e6 20%, #00d4ff 40%, #d4af37 60%, #f0d060 80%, transparent 95%)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default InitialLoadingScreen;
