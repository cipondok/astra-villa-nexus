import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Infinite discovery trigger shown at the bottom of recommendation sections.
 * Encourages users to continue exploring deeper into personalized listings.
 */
export default function DiscoveryTrigger({ className }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={cn("w-full max-w-7xl mx-auto px-3 sm:px-4 py-6", className)}>
      <button
        onClick={() => navigate(user ? '/recommendations' : '/properties')}
        className={cn(
          "w-full group relative overflow-hidden",
          "rounded-xl border border-primary/10 bg-gradient-to-r from-primary/[0.03] via-primary/[0.06] to-primary/[0.03]",
          "px-5 py-4 sm:py-5 flex items-center justify-between gap-4",
          "hover:border-primary/20 hover:shadow-md transition-all duration-300",
          "touch-press"
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-chart-3 animate-pulse" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-bold text-foreground">
              {user ? 'Discover More AI-Matched Properties' : 'Explore All Properties'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user
                ? 'Your recommendations evolve as you browse — the more you explore, the smarter they get'
                : 'Browse thousands of verified listings across Indonesia'}
            </p>
          </div>
        </div>

        {/* Right arrow */}
        <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
}
