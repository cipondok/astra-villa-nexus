import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeBannerProps {
  onDismiss: () => void;
}

const UpgradeBanner = ({ onDismiss }: UpgradeBannerProps) => {
  const { t } = useTranslation();
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
          <div className="relative overflow-hidden rounded-xl bg-primary p-4 shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="h-4 w-4 text-primary-foreground/80" />
            </button>

            <div className="relative flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 p-2 bg-primary-foreground/20 rounded-lg">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-primary-foreground truncate">
                    {t('upgradeBanner.headline')}
                  </h3>
                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-chart-3 text-chart-3-foreground rounded">
                    {t('upgradeBanner.discount')}
                  </span>
                </div>
                <p className="text-xs text-primary-foreground/80 line-clamp-1">
                  {t('upgradeBanner.subtext')}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="flex-shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('upgradeBanner.cta')}</span>
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
