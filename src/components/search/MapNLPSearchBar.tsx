import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, X, Loader2, Mic, MicOff, MapPin, TrendingUp } from 'lucide-react';
import { useNLPSearch, NLPFilters } from '@/hooks/useNLPSearch';
import { MapFilters } from '@/hooks/useMapProperties';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Well-known Indonesian location coordinates for fast lookup */
const LOCATION_COORDS: Record<string, [number, number, number]> = {
  bali: [115.188919, -8.409518, 10],
  jakarta: [106.845599, -6.208763, 11],
  surabaya: [112.752088, -7.257472, 12],
  bandung: [107.619125, -6.917464, 12],
  yogyakarta: [110.361, -7.797, 12],
  lombok: [116.325, -8.565, 10],
  medan: [98.6722, 3.5952, 12],
  semarang: [110.4203, -6.9666, 12],
  makassar: [119.4327, -5.1477, 12],
  denpasar: [115.2167, -8.65, 13],
  ubud: [115.2625, -8.5069, 14],
  seminyak: [115.1589, -8.6913, 14],
  canggu: [115.1385, -8.6478, 14],
  kuta: [115.1745, -8.7181, 14],
  nusa_dua: [115.2317, -8.8006, 14],
  sanur: [115.2622, -8.6841, 14],
  jimbaran: [115.1654, -8.7679, 14],
  tangerang: [106.6297, -6.1781, 12],
  bekasi: [106.9896, -6.2383, 12],
  bogor: [106.798, -6.595, 12],
  malang: [112.6304, -7.9786, 12],
  batam: [104.0305, 1.0456, 12],
  manado: [124.8421, 1.4748, 12],
  solo: [110.8227, -7.5755, 12],
  palembang: [104.7644, -2.9761, 12],
};

function lookupLocation(query: string): [number, number, number] | null {
  const q = query.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (q.includes(key.replace('_', ' ')) || q.includes(key)) return coords;
  }
  return null;
}

/** Fallback: Mapbox geocoding */
async function geocodeLocation(query: string): Promise<[number, number, number] | null> {
  const token = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ';
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query + ' Indonesia')}.json?access_token=${token}&limit=1&country=id`
    );
    const data = await res.json();
    const feat = data.features?.[0];
    if (feat) {
      const [lng, lat] = feat.center;
      const zoom = feat.place_type?.includes('locality') ? 13 : feat.place_type?.includes('place') ? 12 : 10;
      return [lng, lat, zoom];
    }
  } catch {}
  return null;
}

const SpeechRecognition = typeof window !== 'undefined'
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  : null;

export interface MapNLPResult {
  filters: MapFilters;
  flyTo?: { lng: number; lat: number; zoom: number };
  summary?: string;
  rawFilters: NLPFilters;
}

interface MapNLPSearchBarProps {
  onResult: (result: MapNLPResult) => void;
  className?: string;
}

export default function MapNLPSearchBar({ onResult, className }: MapNLPSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lastResult, setLastResult] = useState<NLPFilters | null>(null);
  const recognitionRef = useRef<any>(null);
  const { isProcessing, extractedFilters, intentSummary, processNaturalLanguage, clearNLP } = useNLPSearch();

  const supportsVoice = !!SpeechRecognition;

  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
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
    recognition.lang = 'id-ID';
    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      setQuery(finalTranscript || interim);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) setQuery(finalTranscript.trim());
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const suggestions = [
    'Villa Bali under 3B',
    'Apartment Jakarta 2BR',
    'Investment property Ubud',
    'Land Lombok cheap',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }

    const filters = await processNaturalLanguage(query, 'map_page');
    if (!filters) return;
    setLastResult(filters);

    // Convert NLP filters to MapFilters
    const mapFilters: MapFilters = {
      minPrice: filters.min_price,
      maxPrice: filters.max_price,
      minBedrooms: filters.bedrooms,
      propertyType: filters.property_type,
    };

    // Resolve location → coordinates
    const locationQuery = filters.city || filters.location || filters.state || '';
    let flyTo: MapNLPResult['flyTo'] | undefined;

    if (locationQuery) {
      const local = lookupLocation(locationQuery);
      if (local) {
        flyTo = { lng: local[0], lat: local[1], zoom: local[2] };
      } else {
        const geo = await geocodeLocation(locationQuery);
        if (geo) flyTo = { lng: geo[0], lat: geo[1], zoom: geo[2] };
      }
    }

    onResult({
      filters: mapFilters,
      flyTo,
      summary: filters.intent_summary,
      rawFilters: filters,
    });
  };

  const handleClear = () => {
    setQuery('');
    setLastResult(null);
    clearNLP();
    onResult({ filters: {}, rawFilters: {} as NLPFilters });
  };

  const chips = lastResult ? buildChips(lastResult) : [];

  return (
    <div className={cn('absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl', className)}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border/60 shadow-2xl overflow-hidden"
      >
        {/* Search form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? 'Listening...' : '"Villa in Bali under 2 billion"'}
              className={cn(
                'pl-10 h-10 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0',
                supportsVoice ? 'pr-10' : 'pr-8',
                isListening && 'text-destructive'
              )}
              disabled={isProcessing}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && !isProcessing && !isListening && (
                <button type="button" onClick={handleClear} className="text-muted-foreground hover:text-foreground p-0.5">
                  <X className="h-4 w-4" />
                </button>
              )}
              {supportsVoice && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={isProcessing}
                  className={cn(
                    'p-1 rounded-full transition-all',
                    isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
          <Button type="submit" disabled={isProcessing || !query.trim()} size="sm" className="h-10 px-4 rounded-xl shrink-0">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        {/* Results chips */}
        <AnimatePresence>
          {chips.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2">
                {intentSummary && (
                  <p className="text-xs text-muted-foreground">✨ {intentSummary}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip, i) => (
                    <Badge key={i} variant="secondary" className={cn('text-[10px]', chip.highlight && 'bg-primary/15 text-primary border-primary/30')}>
                      {chip.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function formatPrice(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B IDR`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M IDR`;
  return `${n.toLocaleString()} IDR`;
}

function buildChips(filters: NLPFilters) {
  const chips: { label: string; highlight?: boolean }[] = [];
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
  if (filters.investment_intent) chips.push({ label: '📈 Investment', highlight: true });
  return chips;
}
