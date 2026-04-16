/**
 * Adaptive UI System
 * Renders different UI elements based on user segment.
 */
import React from 'react';
import { Shield, Zap, TrendingUp, Wallet, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserSegment } from '@/hooks/useUserSegmentation';
import type { ConversionScore } from '@/hooks/useConversionScoring';

interface AdaptiveUIProps {
  segment: UserSegment;
  conversionScore: ConversionScore;
  className?: string;
}

export function AdaptiveUI({ segment, conversionScore, className = '' }: AdaptiveUIProps) {
  const { tags } = segment;
  const { recommendedActions } = conversionScore;

  // Don't render if nothing to show
  if (recommendedActions.length === 0 && !tags.includes('hesitant') && !tags.includes('high_intent')) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hesitant user: trust signals */}
      {tags.includes('hesitant') && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">
            Your funds are fully protected under escrow until property verification is complete
          </span>
        </div>
      )}

      {/* High intent: urgency */}
      {tags.includes('high_intent') && !tags.includes('hesitant') && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 animate-fade-in">
          <TrendingUp className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm text-foreground font-medium">
            Properties in this area are moving fast — secure your position now
          </span>
        </div>
      )}

      {/* Price sensitive: financing */}
      {tags.includes('price_sensitive') && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border animate-fade-in">
          <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">
            Start with a secured deposit as low as 1% — flexible payment plans available
          </span>
        </div>
      )}

      {/* Low conversion score: assistance trigger */}
      {conversionScore.score < 30 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 animate-fade-in">
          <Star className="h-4 w-4 text-yellow-500 shrink-0" />
          <span className="text-sm text-muted-foreground">
            Need guidance? Our investment advisors are available to help you find the perfect property
          </span>
        </div>
      )}

      {/* Investor ready: strong signals */}
      {tags.includes('investor_ready') && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Institutional Grade
          </Badge>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            <Clock className="h-3 w-3 mr-1" />
            Limited Availability
          </Badge>
        </div>
      )}
    </div>
  );
}

/**
 * Adaptive CTA that changes text and style based on segment.
 */
interface AdaptiveCTAProps {
  segment: UserSegment;
  defaultText: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AdaptiveCTA({ segment, defaultText, onClick, className = '', size = 'md' }: AdaptiveCTAProps) {
  const { tags } = segment;

  let text = defaultText;
  let variant = 'default';

  if (tags.includes('hesitant')) {
    text = 'Explore with Escrow Protection';
    variant = 'trust';
  } else if (tags.includes('high_intent') || tags.includes('fast_decision')) {
    text = 'Secure Investment Now';
    variant = 'urgency';
  } else if (tags.includes('price_sensitive')) {
    text = 'Start with 1% Deposit';
    variant = 'value';
  } else if (tags.includes('investor_ready')) {
    text = 'Reserve via Escrow';
    variant = 'premium';
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses: Record<string, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    trust: 'bg-primary/90 text-primary-foreground hover:bg-primary border border-primary/50',
    urgency: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg',
    value: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
    premium: 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-medium transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {text}
    </button>
  );
}
