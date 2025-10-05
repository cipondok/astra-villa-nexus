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
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-5 duration-500">
      <div className={cn(
        "glass-effect rounded-xl border border-white/20 shadow-xl overflow-hidden transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}>
        <div className="relative bg-gradient-to-br from-primary/20 via-background to-background p-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Icon */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-grow">
              <h3 className="text-base font-bold text-foreground mb-1">
                New Arrivals! 
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ✨ New 3D villas in Bali! Register for exclusive offers.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleNavigateToOffers}
            size="sm"
            className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group text-xs"
          >
            View Offers
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
