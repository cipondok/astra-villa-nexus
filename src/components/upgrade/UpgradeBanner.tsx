import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const text = {
  en: {
    headline: "Unlock your full potential",
    subtext: "You're using 80% of your free limits. Upgrade for unlimited access.",
    cta: "Upgrade Now",
    discount: "50% OFF"
  },
  id: {
    headline: "Buka potensi penuh Anda",
    subtext: "Anda menggunakan 80% dari batas gratis. Upgrade untuk akses tanpa batas.",
    cta: "Upgrade Sekarang",
    discount: "DISKON 50%"
  }
};

interface UpgradeBannerProps {
  onDismiss: () => void;
}

const UpgradeBanner = ({ onDismiss }: UpgradeBannerProps) => {
  const { language } = useLanguage();
  const t = text[language];
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/80 p-4 shadow-2xl">
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4 text-white/80" />
            </button>

            <div className="relative flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white truncate">
                    {t.headline}
                  </h3>
                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-400 text-yellow-900 rounded">
                    {t.discount}
                  </span>
                </div>
                <p className="text-xs text-white/80 line-clamp-1">
                  {t.subtext}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="flex-shrink-0 bg-white text-primary hover:bg-white/90 gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.cta}</span>
                <ArrowRight className="h-3.5 w-3.5 sm:hidden" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeBanner;
