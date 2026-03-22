import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { cn } from '@/lib/utils';
import { useWelcomeScreenLogo } from '@/hooks/useBrandingLogo';
import welcomeBg from '@/assets/welcome-bg.jpg';
import { Building2, Home, Key } from 'lucide-react';

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
  const t = text[language] || text.en;
  const { logoUrl: brandingLogo } = useWelcomeScreenLogo();
  const [logoUrl, setLogoUrl] = useState<string>(brandingLogo);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLogoUrl(brandingLogo);
  }, [brandingLogo]);

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
      case 'connecting': return 'bg-yellow-400';
      case 'connected': return 'bg-emerald-400';
      case 'error': return 'bg-red-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
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
    <div className="flex items-center justify-center min-h-screen overflow-hidden relative">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={welcomeBg} alt="" className="w-full h-full object-cover" />
      </div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      {/* Accent glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 153, 230, 0.12) 0%, transparent 60%)',
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div 
        className="relative flex flex-col items-center gap-6 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo with glow ring */}
        <motion.div 
          className="relative"
          animate={{ 
            boxShadow: [
              '0 0 0px rgba(0, 153, 230, 0)',
              '0 0 40px rgba(0, 153, 230, 0.4)',
              '0 0 0px rgba(0, 153, 230, 0)'
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.img 
            src={logoUrl}
            alt="ASTRA Villa"
            className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          />
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-transparent"
            style={{
              borderTopColor: 'rgba(0, 153, 230, 0.6)',
              borderRightColor: 'rgba(212, 175, 55, 0.4)'
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
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #0099e6 0%, #00d4ff 50%, #d4af37 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ASTRA
            </motion.span>
            <span className="text-white/90 ml-3">Villa</span>
          </h1>
          <motion.p 
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/50 mt-2"
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
              className="w-2 h-2 rounded-full"
              style={{
                background: i < 2 ? '#0099e6' : i < 4 ? '#00d4ff' : '#d4af37'
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

        {/* Progress bar in glassmorphic card */}
        <motion.div 
          className="w-64 md:w-80 rounded-xl p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #0099e6, #00d4ff, #d4af37)',
                filter: 'blur(3px)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #0099e6, #00d4ff, #d4af37, #0099e6)',
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
            <span className="text-[10px] text-white/50">{displayMessage}</span>
            <span className="text-[10px] font-medium" style={{ color: '#00d4ff' }}>
              {Math.round(Math.min(progress, 100))}%
            </span>
          </div>
        </motion.div>

        {/* Connection Status */}
        {propShowConnectionStatus && (
          <motion.div 
            className="flex items-center gap-2 text-xs text-white/60"
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
