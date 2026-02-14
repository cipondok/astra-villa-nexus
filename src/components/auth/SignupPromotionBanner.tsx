
import { useState, useEffect } from 'react';
import { Gift, Star, Clock, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignupPromotionBannerProps {
  onSignupClick: () => void;
  compact?: boolean;
}

const PROMO_END_DATE = new Date('2026-03-31T23:59:59');

const SignupPromotionBanner = ({ onSignupClick, compact = false }: SignupPromotionBannerProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = PROMO_END_DATE.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="relative bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border border-primary/30 rounded-lg p-3 mb-3">
        <button onClick={() => setDismissed(true)} className="absolute top-1 right-1 p-0.5 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
        <div className="flex items-center gap-2 mb-1.5">
          <Gift className="h-4 w-4 text-primary animate-bounce" />
          <span className="text-xs font-bold text-primary">🎉 LIMITED TIME OFFER</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight mb-2">
          Sign up now & get <span className="font-bold text-foreground">500 ASTRA Tokens</span> + <span className="font-bold text-foreground">30-Day Free VIP</span>!
        </p>
        <div className="flex items-center gap-1.5 text-[9px]">
          <Clock className="h-3 w-3 text-destructive" />
          <span className="font-mono font-bold text-destructive">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/10 border border-primary/30 rounded-xl p-5 mb-6">
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground z-10">
        <X className="h-4 w-4" />
      </button>

      {/* Decorative elements */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-accent/10 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">🎉 Limited-Time Signup Offer!</h3>
            <p className="text-[10px] text-muted-foreground">Join now and unlock exclusive rewards</p>
          </div>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2 border border-border/50">
            <Gift className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-foreground">500 ASTRA Tokens</p>
              <p className="text-[8px] text-muted-foreground">Welcome bonus</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2 border border-border/50">
            <Star className="h-4 w-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-foreground">30-Day Free VIP</p>
              <p className="text-[8px] text-muted-foreground">Premium access</p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-between bg-destructive/10 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-destructive" />
            <span className="text-[10px] font-medium text-destructive">Offer ends in:</span>
          </div>
          <div className="flex gap-1">
            {[
              { val: timeLeft.days, label: 'D' },
              { val: timeLeft.hours, label: 'H' },
              { val: timeLeft.minutes, label: 'M' },
              { val: timeLeft.seconds, label: 'S' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <span className="bg-destructive/20 text-destructive font-mono font-bold text-xs px-1 py-0.5 rounded">
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="text-[8px] text-destructive/70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={onSignupClick}
          size="sm"
          className="w-full h-8 text-xs bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-lg"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          Claim Your Free Rewards — Sign Up Now!
        </Button>
      </div>
    </div>
  );
};

export default SignupPromotionBanner;
