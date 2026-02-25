import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Search, X, TrendingUp, Loader2, Mic, MicOff } from 'lucide-react';
import { useNLPSearch, NLPFilters } from '@/hooks/useNLPSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NLPSearchBarProps {
  onApplyFilters: (searchParams: ReturnType<ReturnType<typeof useNLPSearch>['toSearchParams']>) => void;
  className?: string;
}

const formatPrice = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B IDR`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M IDR`;
  return `${n.toLocaleString()} IDR`;
};

// Check browser support for Web Speech API
const SpeechRecognition = typeof window !== 'undefined'
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  : null;

export default function NLPSearchBar({ onApplyFilters, className }: NLPSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { isProcessing, extractedFilters, intentSummary, processNaturalLanguage, toSearchParams, clearNLP } = useNLPSearch();

  const supportsVoice = !!SpeechRecognition;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'id-ID'; // Indonesian + English fallback
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      setQuery(finalTranscript || interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-submit if we got a final transcript
      if (finalTranscript.trim()) {
        setQuery(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    const filters = await processNaturalLanguage(query);
    if (filters) {
      onApplyFilters(toSearchParams(filters));
    }
  };

  const chips = buildChips(extractedFilters);

  return (
    <Card className={cn('border-primary/20 bg-card/80 backdrop-blur-sm', className)}>
      <CardContent className="p-4 space-y-3">
        {/* Header label */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI-Powered Search</span>
          {supportsVoice && (
            <span className="text-[10px] text-muted-foreground ml-auto">🎙️ Voice enabled</span>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? 'Listening... speak now' : 'Try: "Luxury villa in Bali under 5 billion with pool and good ROI"'}
              className={cn(
                "pl-10 h-11 text-sm bg-background border-border focus:border-primary/40",
                supportsVoice ? "pr-16" : "pr-8",
                isListening && "border-destructive/50 ring-2 ring-destructive/20"
              )}
              disabled={isProcessing}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && !isProcessing && !isListening && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); clearNLP(); }}
                  className="text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {supportsVoice && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={isProcessing}
                  className={cn(
                    "p-1 rounded-full transition-all",
                    isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
          <Button type="submit" disabled={isProcessing || !query.trim()} className="h-11 px-5 shrink-0">
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Search</>
            )}
          </Button>
        </form>

        {/* Listening indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-2 rounded-md bg-destructive/10 border border-destructive/20"
            >
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-destructive rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 h-4 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 h-6 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.45s' }} />
                <span className="w-1 h-3 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
              <span className="text-xs font-medium text-destructive">
                Listening — speak your property requirements naturally
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleVoice}
                className="ml-auto h-6 text-xs text-destructive hover:text-destructive/80"
              >
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results area */}
        <AnimatePresence>
          {extractedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {intentSummary && (
                <p className="text-sm text-muted-foreground italic">✨ {intentSummary}</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {chips.map((chip, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      chip.highlight && 'bg-primary/15 text-primary border-primary/30'
                    )}
                  >
                    {chip.icon && <chip.icon className="h-3 w-3 mr-1" />}
                    {chip.label}
                  </Badge>
                ))}
              </div>

              {extractedFilters.investment_intent && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    Investment-focused results — prioritizing properties with high ROI potential
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function buildChips(filters: NLPFilters | null) {
  if (!filters) return [];
  const chips: { label: string; icon?: any; highlight?: boolean }[] = [];

  if (filters.location) chips.push({ label: `📍 ${filters.location}` });
  if (filters.state && filters.state !== filters.location) chips.push({ label: `🗺️ ${filters.state}` });
  if (filters.city) chips.push({ label: `🏙️ ${filters.city}` });
  if (filters.property_type) chips.push({ label: `🏠 ${filters.property_type}` });
  if (filters.listing_type) chips.push({ label: filters.listing_type === 'rent' ? '🔑 Rent' : '💰 Buy' });
  if (filters.min_price && filters.max_price) chips.push({ label: `💵 ${formatPrice(filters.min_price)} – ${formatPrice(filters.max_price)}` });
  else if (filters.max_price) chips.push({ label: `💵 Under ${formatPrice(filters.max_price)}` });
  else if (filters.min_price) chips.push({ label: `💵 Above ${formatPrice(filters.min_price)}` });
  if (filters.bedrooms) chips.push({ label: `🛏️ ${filters.bedrooms}+ beds` });
  if (filters.bathrooms) chips.push({ label: `🚿 ${filters.bathrooms}+ baths` });
  if (filters.amenities?.length) filters.amenities.forEach(a => chips.push({ label: `✅ ${a}` }));
  if (filters.features?.length) filters.features.forEach(f => chips.push({ label: `⭐ ${f}` }));
  if (filters.furnishing) chips.push({ label: `🪑 ${filters.furnishing}` });
  if (filters.investment_intent) chips.push({ label: '📈 Investment', icon: TrendingUp, highlight: true });

  return chips;
}
