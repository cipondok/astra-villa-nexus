import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, MapPin, Home, ArrowRight, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictedIntent {
  label: string;
  type: 'location' | 'style' | 'investment' | 'trending';
  query: string;
  confidence: number;
}

const INTENT_ICONS = {
  location: MapPin,
  style: Home,
  investment: TrendingUp,
  trending: Zap,
};

/**
 * PredictiveSearchCanvas — A next-gen search surface that anticipates
 * user intent before they finish typing. Shows predictive suggestions,
 * trending searches, and visual intent categories.
 */
export default function PredictiveSearchCanvas({ className }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [predictions, setPredictions] = useState<PredictedIntent[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Static trending intents (would come from API in production)
  const trendingIntents: PredictedIntent[] = [
    { label: 'Villas in Bali under 5B', type: 'trending', query: 'villa bali under 5 billion', confidence: 0.95 },
    { label: 'High-yield apartments Jakarta', type: 'investment', query: 'apartment jakarta high yield', confidence: 0.88 },
    { label: 'Beachfront Lombok', type: 'location', query: 'beachfront lombok', confidence: 0.82 },
    { label: 'New launches Tangerang', type: 'trending', query: 'new launch tangerang', confidence: 0.79 },
  ];

  const generatePredictions = useCallback((input: string) => {
    if (!input.trim()) {
      setPredictions(trendingIntents);
      return;
    }
    const lower = input.toLowerCase();
    const matched: PredictedIntent[] = [];

    // Location-based predictions
    const cities = ['bali', 'jakarta', 'bandung', 'surabaya', 'lombok', 'yogyakarta'];
    const matchedCity = cities.find(c => lower.includes(c));
    if (matchedCity) {
      matched.push({ label: `Best deals in ${matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1)}`, type: 'investment', query: `deals ${matchedCity}`, confidence: 0.9 });
      matched.push({ label: `Trending properties in ${matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1)}`, type: 'trending', query: `trending ${matchedCity}`, confidence: 0.85 });
    }

    // Property type predictions
    const types = ['villa', 'apartment', 'house', 'land', 'townhouse'];
    const matchedType = types.find(t => lower.includes(t));
    if (matchedType) {
      matched.push({ label: `Top ${matchedType}s for investment`, type: 'investment', query: `${matchedType} investment`, confidence: 0.87 });
    }

    // Always add a direct search option
    matched.push({ label: `Search "${input}"`, type: 'style', query: input, confidence: 1 });

    setPredictions(matched.slice(0, 5));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generatePredictions(query), 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, generatePredictions]);

  useEffect(() => {
    if (isFocused && !query) setPredictions(trendingIntents);
  }, [isFocused]);

  const handleSelect = (intent: PredictedIntent) => {
    navigate(`/ai-search?q=${encodeURIComponent(intent.query)}`);
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <div className="relative">
        {/* Main search input */}
        <div className={cn(
          'relative flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-all duration-300',
          isFocused
            ? 'border-primary/30 shadow-lg shadow-primary/5 ring-2 ring-primary/10'
            : 'border-border/50 shadow-sm hover:border-border'
        )}>
          <div className="relative shrink-0">
            <Search className="h-5 w-5 text-muted-foreground" />
            {isFocused && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              </motion.div>
            )}
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim()) {
                navigate(`/ai-search?q=${encodeURIComponent(query)}`);
              }
            }}
            placeholder="Describe your dream property..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate(`/ai-search?q=${encodeURIComponent(query)}`)}
              className="shrink-0 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
            >
              <Zap className="h-3 w-3" /> Search
            </motion.button>
          )}
        </div>

        {/* Predictive dropdown */}
        <AnimatePresence>
          {isFocused && predictions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden z-50"
            >
              <div className="px-3 py-2 border-b border-border/30">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {query ? 'AI Predictions' : 'Trending Now'}
                </span>
              </div>
              <div className="py-1">
                {predictions.map((intent, i) => {
                  const Icon = INTENT_ICONS[intent.type];
                  return (
                    <motion.button
                      key={`${intent.query}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onMouseDown={() => handleSelect(intent)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors group"
                    >
                      <div className={cn(
                        'shrink-0 h-8 w-8 rounded-lg flex items-center justify-center',
                        intent.type === 'trending' && 'bg-chart-1/10 text-chart-1',
                        intent.type === 'investment' && 'bg-chart-2/10 text-chart-2',
                        intent.type === 'location' && 'bg-primary/10 text-primary',
                        intent.type === 'style' && 'bg-accent text-accent-foreground',
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-sm text-foreground text-left truncate">{intent.label}</span>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {intent.confidence >= 0.85 && (
                          <span className="text-[9px] font-medium text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full">
                            High match
                          </span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
