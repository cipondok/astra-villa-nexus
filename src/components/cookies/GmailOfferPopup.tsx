import { Button } from '@/components/ui/button';
import { X, Gift, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GmailOfferPopupProps {
  show: boolean;
  onClose: () => void;
  email: string;
}

const GmailOfferPopup = ({ show, onClose, email }: GmailOfferPopupProps) => {
  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        {/* Modal */}
        <div className={cn(
          "relative max-w-md w-full glass-effect rounded-xl border border-white/20 shadow-xl overflow-hidden",
          "animate-in zoom-in-95 duration-300"
        )}>
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background opacity-50" />
          
          {/* Content */}
          <div className="relative p-6">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 hover:bg-white/10 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Mail className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              🎉 Welcome Google User!
            </h2>

            {/* Subtitle */}
            <p className="text-center text-muted-foreground mb-4 text-sm">
              We've detected you're using Gmail
            </p>

            {/* Offer Card */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-4 border border-primary/30 mb-4">
              <div className="text-center space-y-2">
                <div className="inline-block px-3 py-1 bg-primary/20 rounded-full mb-1">
                  <span className="text-xl font-bold text-primary">5% OFF</span>
                </div>
                <p className="text-foreground font-semibold">
                  Your First 3D Villa Booking
                </p>
                <p className="text-xs text-muted-foreground">
                  Exclusive for {email}
                </p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-4">
              {[
                'Instant booking',
                'Priority support',
                'Flexible cancellation',
                'VIP concierge'
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={onClose}
              size="sm"
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
            >
              Claim Your Offer Now
            </Button>

            {/* Fine Print */}
            <p className="text-xs text-center text-muted-foreground mt-3">
              *First-time bookings only. T&C apply.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GmailOfferPopup;
