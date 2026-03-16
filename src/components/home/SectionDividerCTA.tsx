import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface SectionDividerCTAProps {
  icon: LucideIcon;
  headline: string;
  description: string;
  ctaText: string;
  ctaRoute: string;
  variant?: 'default' | 'accent';
}

export default function SectionDividerCTA({
  icon: Icon,
  headline,
  description,
  ctaText,
  ctaRoute,
  variant = 'default',
}: SectionDividerCTAProps) {
  const navigate = useNavigate();

  return (
    <div className="relative py-6 sm:py-8 my-2">
      {/* Divider lines */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative flex justify-center">
        <div className={`flex items-center gap-3 sm:gap-4 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl border backdrop-blur-sm ${
          variant === 'accent'
            ? 'bg-gold-primary/5 border-gold-primary/20'
            : 'bg-card/80 border-border/50'
        }`}>
          <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${
            variant === 'accent' ? 'bg-gold-primary/15' : 'bg-primary/10'
          }`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
              variant === 'accent' ? 'text-gold-primary' : 'text-primary'
            }`} />
          </div>

          <div className="text-left">
            <p className="text-xs sm:text-sm font-semibold text-foreground">{headline}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{description}</p>
          </div>

          <Button
            size="sm"
            variant={variant === 'accent' ? 'default' : 'outline'}
            onClick={() => navigate(ctaRoute)}
            className={`h-8 sm:h-9 px-4 text-xs font-semibold shrink-0 ${
              variant === 'accent'
                ? 'bg-gold-primary hover:bg-gold-primary/90 text-background'
                : ''
            }`}
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
}
