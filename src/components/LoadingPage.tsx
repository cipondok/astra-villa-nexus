import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useConnectionSpeed } from '@/hooks/useConnectionSpeed';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import astraLogo from '@/assets/astra-logo.png';

interface LoadingPageProps {
  message?: string;
  showConnectionStatus?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
}

const text = {
  en: {
    defaultMessage: "Loading, please wait...",
    slowInternet: "Slow internet detected",
    noInternet: "No internet connection",
    checkingDatabase: "Connecting to server...",
    databaseReady: "Connected",
    databaseUnavailable: "Server unavailable",
    workingOffline: "Working offline",
    initializing: "Initializing...",
  },
  id: {
    defaultMessage: "Memuat, harap tunggu...",
    slowInternet: "Koneksi lambat terdeteksi",
    noInternet: "Tidak ada koneksi internet",
    checkingDatabase: "Menghubungkan ke server...",
    databaseReady: "Terhubung",
    databaseUnavailable: "Server tidak tersedia",
    workingOffline: "Bekerja offline",
    initializing: "Menginisialisasi...",
  },
};

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message,
  showConnectionStatus = false,
  connectionStatus = 'connecting'
}) => {
  const { speed } = useConnectionSpeed();
  const { language } = useLanguage();
  const t = text[language];

  const displayMessage = message || t.defaultMessage;

  const getConnectionInfo = () => {
    if (speed === 'slow') {
      return { message: t.slowInternet, color: 'text-orange-400', bgColor: 'bg-orange-400', Icon: AlertCircle };
    }
    if (speed === 'offline') {
      return { message: t.noInternet, color: 'text-red-400', bgColor: 'bg-red-400', Icon: WifiOff };
    }

    switch (connectionStatus) {
      case 'connecting':
        return { message: t.checkingDatabase, color: 'text-yellow-400', bgColor: 'bg-yellow-400', Icon: Wifi };
      case 'connected':
        return { message: t.databaseReady, color: 'text-green-400', bgColor: 'bg-green-400', Icon: CheckCircle };
      case 'error':
        return { message: t.databaseUnavailable, color: 'text-red-400', bgColor: 'bg-red-400', Icon: AlertCircle };
      case 'offline':
        return { message: t.workingOffline, color: 'text-muted-foreground', bgColor: 'bg-muted-foreground', Icon: WifiOff };
      default:
        return { message: t.initializing, color: 'text-muted-foreground', bgColor: 'bg-muted-foreground', Icon: Loader2 };
    }
  };

  const connInfo = getConnectionInfo();

  return (
    <div className="bg-background text-foreground flex items-center justify-center min-h-screen">
      <motion.div 
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo with animated effects */}
        <motion.div 
          className="relative"
          animate={{ 
            boxShadow: [
              '0 0 0px rgba(127, 90, 240, 0)',
              '0 0 30px rgba(127, 90, 240, 0.3)',
              '0 0 0px rgba(127, 90, 240, 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img 
            src={astraLogo} 
            alt="ASTRA Villa" 
            className="w-20 h-20 object-contain rounded-2xl"
          />
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-primary/60 border-r-accent/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Brand Name */}
        <div className="text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              ASTRA
            </span>
            <span className="text-foreground ml-2">Villa</span>
          </motion.h1>
          <motion.p 
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Premium Real Estate
          </motion.p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#f97316'
              }}
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Message */}
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {displayMessage}
        </motion.p>

        {/* Connection Status */}
        {showConnectionStatus && (
          <motion.div 
            className={cn("flex items-center gap-2 text-xs", connInfo.color)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className={cn("w-2 h-2 rounded-full", connInfo.bgColor)}
              animate={connectionStatus === 'connecting' || speed === 'slow' ? { opacity: [0.4, 1, 0.4] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <connInfo.Icon className="w-3.5 h-3.5" />
            <span>{connInfo.message}</span>
          </motion.div>
        )}

        {/* Progress bar */}
        <motion.div 
          className="w-48 h-1 bg-muted/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingPage;
