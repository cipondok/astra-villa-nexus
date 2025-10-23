import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationPopupProps {
  show: boolean;
  onClose: () => void;
}

const NotificationPopup = ({ show, onClose }: NotificationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleNavigateToOffers = () => {
    navigate('/offers');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed top-16 right-2 md:top-20 md:right-4 z-[9999] max-w-[280px] md:max-w-sm animate-in slide-in-from-top-5 duration-500">
      <div className={cn(
        "glass-effect rounded-lg md:rounded-xl border border-white/20 shadow-xl overflow-hidden transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}>
        <div className="relative bg-gradient-to-br from-primary/20 via-background to-background p-2.5 md:p-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-1.5 right-1.5 md:top-3 md:right-3 hover:bg-white/10 rounded-full h-7 w-7 md:h-auto md:w-auto"
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </Button>

          {/* Icon */}
          <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            
            <div className="flex-grow">
              <h3 className="text-sm md:text-base font-bold text-foreground mb-0.5 md:mb-1">
                New Arrivals! 
              </h3>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                ✨ New 3D villas in Bali! Register for exclusive offers.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleNavigateToOffers}
            size="sm"
            className="w-full gap-1.5 md:gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group text-[10px] md:text-xs h-7 md:h-9"
          >
            View Offers
            <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
