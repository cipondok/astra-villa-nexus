import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SectionDividerCTAProps {
  icon: LucideIcon;
  headline: string;
  description: string;
  ctaText: string;
  ctaRoute: string;
  /** default = subtle inline | accent = gold highlight | primary = strong action */
  variant?: 'default' | 'accent' | 'primary';
  /** secondary action */
  secondaryText?: string;
  secondaryRoute?: string;
}

export default function SectionDividerCTA({
  icon: Icon,
  headline,
  description,
  ctaText,
  ctaRoute,
  variant = 'default',
  secondaryText,
  secondaryRoute,
}: SectionDividerCTAProps) {
  const navigate = useNavigate();

  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';

  return (
    <div className="relative py-6 sm:py-8 my-2">
      {/* Divider line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative flex justify-center px-3">
        <div className={cn(
          "flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-5 sm:px-8 py-4 sm:py-5 rounded-2xl border backdrop-blur-sm transition-shadow duration-300",
          isPrimary && "bg-primary/5 border-primary/25 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.15)]",
          isAccent && "bg-gold-primary/5 border-gold-primary/20 hover:shadow-[0_4px_20px_-4px_hsl(var(--gold-primary)/0.15)]",
          !isPrimary && !isAccent && "bg-card/80 border-border/50 hover:shadow-sm",
        )}>
          {/* Icon */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0",
            isPrimary && "bg-primary/10",
            isAccent && "bg-gold-primary/15",
            !isPrimary && !isAccent && "bg-muted",
          )}>
            <Icon className={cn(
              "h-5 w-5",
              isPrimary && "text-primary",
              isAccent && "text-gold-primary",
              !isPrimary && !isAccent && "text-foreground/70",
            )} />
          </div>

          {/* Copy */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <p className={cn(
              "text-sm sm:text-base font-bold text-foreground leading-snug",
              isPrimary && "font-playfair"
            )}>
              {headline}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {secondaryText && secondaryRoute && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(secondaryRoute)}
                className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground min-h-[36px]"
              >
                {secondaryText}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => navigate(ctaRoute)}
              className={cn(
                "h-9 sm:h-10 px-5 text-xs sm:text-sm font-semibold gap-1.5 min-h-[36px]",
                isPrimary && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md",
                isAccent && "bg-gold-primary hover:bg-gold-primary/90 text-background shadow-md",
                !isPrimary && !isAccent && "bg-card border border-border hover:bg-muted text-foreground",
              )}
            >
              {ctaText}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
