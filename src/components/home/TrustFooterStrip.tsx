import { Shield, Lock, Scale, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Subtle trust governance strip shown below discovery sections.
 * Communicates legal compliance, data protection, and marketplace standards
 * without being intrusive — builds subconscious confidence.
 */
export default function TrustFooterStrip({ className }: { className?: string }) {
  const signals = [
    {
      icon: Shield,
      label: 'Verified Listings',
      detail: 'All properties reviewed before publication',
    },
    {
      icon: Lock,
      label: 'Secure Data',
      detail: 'End-to-end encrypted inquiries',
    },
    {
      icon: Scale,
      label: 'Fair Pricing',
      detail: 'AI-audited market valuations',
    },
    {
      icon: BadgeCheck,
      label: 'Licensed Agents',
      detail: 'KYC-verified professionals',
    },
  ];

  return (
    <div className={cn(
      "w-full border-t border-border/40 bg-muted/20",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        {/* Heading */}
        <p className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
          Your protection, our standard
        </p>

        {/* Trust signals grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {signals.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-1.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/5 border border-primary/10">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                {s.label}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground leading-snug max-w-[140px]">
                {s.detail}
              </span>
            </div>
          ))}
        </div>

        {/* Legal microcopy */}
        <p className="text-center text-[10px] text-muted-foreground/60 mt-2.5 max-w-lg mx-auto leading-relaxed">
          ASTRAVILLA operates in compliance with Indonesian property transaction regulations.
          All listing data is independently verified and AI-audited for accuracy.
        </p>
      </div>
    </div>
  );
}
