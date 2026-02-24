import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { cn } from '@/lib/utils';
import { useWelcomeScreenLogo } from '@/hooks/useBrandingLogo';

interface LoadingPageProps {
  message?: string;
  showConnectionStatus?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
}

const text = {
  en: {
    defaultMessage: "Initializing ASTRA Villa...",
    defaultSubMessage: "Please wait while we prepare your experience",
    logoSubtext: "PREMIUM REAL ESTATE",
    checkingDatabase: "Connecting...",
    databaseReady: "Connected",
    databaseUnavailable: "Unavailable",
    workingOffline: "Offline",
    initializing: "Initializing...",
  },
  id: {
    defaultMessage: "Menginisialisasi ASTRA Villa...",
    defaultSubMessage: "Harap tunggu sementara kami menyiapkan pengalaman Anda",
    logoSubtext: "REAL ESTAT PREMIUM",
    checkingDatabase: "Menghubungkan...",
    databaseReady: "Terhubung",
    databaseUnavailable: "Tidak tersedia",
    workingOffline: "Offline",
    initializing: "Menginisialisasi...",
  },
};

const CustomizableLoadingPage: React.FC<LoadingPageProps> = ({ 
  message: propMessage,
  showConnectionStatus: propShowConnectionStatus = false,
  connectionStatus = 'connecting'
}) => {
  const { language } = useTranslation();
  const t = text[language];
  const { logoUrl: brandingLogo } = useWelcomeScreenLogo();
  const [logoUrl, setLogoUrl] = useState<string>(brandingLogo);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLogoUrl(brandingLogo);
  }, [brandingLogo]);

  // Animate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const displayMessage = propMessage || t.defaultMessage;

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connecting': return 'bg-chart-3';
      case 'connected': return 'bg-chart-1';
      case 'error': return 'bg-destructive';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getConnectionMessage = () => {
    switch (connectionStatus) {
      case 'connecting': return t.checkingDatabase;
      case 'connected': return t.databaseReady;
      case 'error': return t.databaseUnavailable;
      case 'offline': return t.workingOffline;
      default: return t.initializing;
    }
  };

  return (
    <div className="bg-background text-foreground flex items-center justify-center min-h-screen overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[100px] opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, hsl(var(--accent) / 0.3) 0%, transparent 50%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div 
        className="relative flex flex-col items-center gap-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo with premium effects */}
        <motion.div 
          className="relative"
          animate={{ 
            boxShadow: [
              '0 0 0px hsl(var(--accent) / 0)',
              '0 0 40px hsl(var(--accent) / 0.4)',
              '0 0 0px hsl(var(--accent) / 0)'
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.img 
            src={logoUrl}
            alt="ASTRA Villa"
            className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          />
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-transparent"
            style={{
              borderTopColor: 'hsl(var(--primary) / 0.6)',
              borderRightColor: 'hsl(var(--accent) / 0.4)'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <motion.span 
              className="bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              style={{ backgroundSize: '200% 200%' }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ASTRA
            </motion.span>
            <span className="text-foreground ml-3">Villa</span>
          </h1>
          <motion.p 
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t.logoSubtext}
          </motion.p>
        </motion.div>

        {/* Animated loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--accent))' : 'hsl(var(--chart-3))'
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div 
          className="w-64 md:w-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
            {/* Glow */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full blur-sm"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--chart-3)))',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Fill */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--chart-3)), hsl(var(--primary)))',
                backgroundSize: '300% 100%'
              }}
              initial={{ width: '0%' }}
              animate={{ 
                width: `${Math.min(progress, 100)}%`,
                backgroundPosition: ['0% 50%', '100% 50%']
              }}
              transition={{ 
                width: { duration: 0.3 },
                backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
              }}
            />
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                width: '30%'
              }}
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">{displayMessage}</span>
            <span className="text-[10px] font-medium bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
              {Math.round(Math.min(progress, 100))}%
            </span>
          </div>
        </motion.div>

        {/* Connection Status */}
        {propShowConnectionStatus && (
          <motion.div 
            className="flex items-center gap-2 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className={cn("w-2 h-2 rounded-full", getConnectionColor())}
              animate={connectionStatus === 'connecting' ? { opacity: [0.4, 1, 0.4] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>{getConnectionMessage()}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CustomizableLoadingPage;
