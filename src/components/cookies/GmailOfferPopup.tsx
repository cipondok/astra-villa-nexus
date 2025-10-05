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
          "relative max-w-lg w-full glass-effect rounded-2xl border border-white/20 shadow-2xl overflow-hidden",
          "animate-in zoom-in-95 duration-300"
        )}>
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background opacity-50" />
          
          {/* Content */}
          <div className="relative p-8">
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
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center text-foreground mb-3">
              🎉 Welcome Google User!
            </h2>

            {/* Subtitle */}
            <p className="text-center text-muted-foreground mb-6 text-lg">
              We've detected you're using Gmail
            </p>

            {/* Offer Card */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 border border-primary/30 mb-6">
              <div className="text-center space-y-3">
                <div className="inline-block px-4 py-2 bg-primary/20 rounded-full mb-2">
                  <span className="text-2xl font-bold text-primary">5% OFF</span>
                </div>
                <p className="text-foreground font-semibold text-lg">
                  Your First 3D Villa Booking
                </p>
                <p className="text-sm text-muted-foreground">
                  Exclusive discount for {email}
                </p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {[
                'Instant booking confirmation',
                'Priority customer support',
                'Flexible cancellation policy',
                'VIP concierge service'
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={onClose}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base"
            >
              Claim Your Offer Now
            </Button>

            {/* Fine Print */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              *Offer valid for first-time bookings only. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GmailOfferPopup;
