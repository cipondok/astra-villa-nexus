import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Search, Send, MapPin, Bed, Bath, Maximize2, TrendingUp,
  Loader2, Mic, MicOff, X, ArrowRight, Bot, User, ChevronDown, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNLPSearch, NLPFilters } from '@/hooks/useNLPSearch';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// ── Types ──
interface SearchMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  filters?: NLPFilters;
  properties?: PropertyResult[];
  isLoading?: boolean;
}

interface PropertyResult {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  location: string;
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  building_area_sqm: number | null;
  land_area_sqm: number | null;
  images: string[];
  image_urls: string[];
  thumbnail_url: string | null;
  investment_score: number | null;
}

// ── Helpers ──
const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)} M`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)} jt`;
  return `Rp ${price.toLocaleString()}`;
};

const SpeechRecognition = typeof window !== 'undefined'
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  : null;

const SUGGESTIONS = [
  'Villa di Bali di bawah 3 miliar',
  'Apartment Jakarta 2 kamar tidur',
  'Properti investasi di bawah 2M',
  'Rumah modern Bandung dengan kolam renang',
  'Tanah murah di Lombok',
  'Villa Ubud ROI tinggi',
];

// ── Property Card ──
function PropertyResultCard({ property, onClick }: { property: PropertyResult; onClick: () => void }) {
  const img = property.thumbnail_url || property.images?.[0] || property.image_urls?.[0] || '/placeholder.svg';
  const score = property.investment_score || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-card">
        <div className="relative h-36 overflow-hidden">
          <img
            src={img}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold text-xs shadow-md">
            {formatPrice(property.price)}
          </Badge>
          {score >= 60 && (
            <Badge className="absolute top-2 right-2 bg-chart-1/90 text-[10px] shadow-md">
              <TrendingUp className="h-3 w-3 mr-0.5" /> {score}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h4 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{property.title}</h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{property.city || property.location}{property.state ? `, ${property.state}` : ''}</span>
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {property.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
            {property.building_area_sqm && <span className="flex items-center gap-0.5"><Maximize2 className="h-3 w-3" />{property.building_area_sqm}m²</span>}
            <Badge variant="outline" className="text-[9px] ml-auto">{property.property_type}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Filter chips ──
function FilterChips({ filters }: { filters: NLPFilters }) {
  const chips: { label: string; highlight?: boolean }[] = [];
  if (filters.location) chips.push({ label: `📍 ${filters.location}` });
  if (filters.state && filters.state !== filters.location) chips.push({ label: `🗺️ ${filters.state}` });
  if (filters.city) chips.push({ label: `🏙️ ${filters.city}` });
  if (filters.property_type) chips.push({ label: `🏠 ${filters.property_type}` });
  if (filters.listing_type) chips.push({ label: filters.listing_type === 'rent' ? '🔑 Sewa' : '💰 Beli' });
  if (filters.min_price && filters.max_price) {
    chips.push({ label: `💵 ${formatPrice(filters.min_price)} – ${formatPrice(filters.max_price)}` });
  } else if (filters.max_price) {
    chips.push({ label: `💵 Di bawah ${formatPrice(filters.max_price)}` });
  } else if (filters.min_price) {
    chips.push({ label: `💵 Di atas ${formatPrice(filters.min_price)}` });
  }
  if (filters.bedrooms) chips.push({ label: `🛏️ ${filters.bedrooms}+ KT` });
  if (filters.bathrooms) chips.push({ label: `🚿 ${filters.bathrooms}+ KM` });
  if (filters.investment_intent) chips.push({ label: '📈 Investasi', highlight: true });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((chip, i) => (
        <Badge key={i} variant="secondary" className={cn('text-[10px]', chip.highlight && 'bg-primary/15 text-primary border-primary/30')}>
          {chip.label}
        </Badge>
      ))}
    </div>
  );
}

// ── Main Page ──
export default function AISearchAssistantPage() {
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { isProcessing, processNaturalLanguage, toSearchParams } = useNLPSearch();
  const supportsVoice = !!SpeechRecognition;

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Cleanup
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  // Voice toggle
  const toggleVoice = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
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
      setInput(finalTranscript || interim);
    };
    recognition.onend = () => { setIsListening(false); if (finalTranscript.trim()) setInput(finalTranscript.trim()); };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Search for properties using filters
  const searchProperties = useCallback(async (filters: NLPFilters): Promise<PropertyResult[]> => {
    try {
      const { data, error } = await (supabase as any).rpc('search_properties_advanced', {
        p_search_text: null,
        p_property_type: filters.property_type || null,
        p_listing_type: filters.listing_type || null,
        p_development_status: null,
        p_state: filters.state || filters.location || null,
        p_city: filters.city || null,
        p_location: null,
        p_min_price: filters.min_price || null,
        p_max_price: filters.max_price || null,
        p_min_bedrooms: filters.bedrooms || null,
        p_max_bedrooms: null,
        p_min_bathrooms: filters.bathrooms || null,
        p_max_bathrooms: null,
        p_min_area: filters.min_area || null,
        p_max_area: filters.max_area || null,
        p_furnishing: filters.furnishing || null,
        p_parking: null,
        p_floor_level: null,
        p_building_age: null,
        p_sort_by: filters.sort_by || 'newest',
        p_limit: 12,
        p_offset: 0,
      });
      if (error) throw error;
      return (data || []) as PropertyResult[];
    } catch (err) {
      console.error('Property search error:', err);
      return [];
    }
  }, []);

  // Send message
  const handleSend = useCallback(async (query?: string) => {
    const text = (query || input).trim();
    if (!text || isProcessing) return;
    setInput('');
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }

    const userMsg: SearchMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const loadingMsg: SearchMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);

    // Process NLP
    const filters = await processNaturalLanguage(text, 'ai_search_assistant');

    if (!filters) {
      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? { ...m, content: 'Maaf, saya tidak bisa memahami pencarian Anda. Coba gunakan format seperti "villa di bali di bawah 3 miliar" atau "apartment jakarta 2 kamar tidur".', isLoading: false }
          : m
      ));
      return;
    }

    // Fetch matching properties
    const properties = await searchProperties(filters);

    const summary = filters.intent_summary || '';
    const resultText = properties.length > 0
      ? `${summary ? `✨ ${summary}\n\n` : ''}Saya menemukan **${properties.length} properti** yang sesuai dengan pencarian Anda. Berikut hasilnya:`
      : `${summary ? `✨ ${summary}\n\n` : ''}Maaf, tidak ada properti yang cocok dengan kriteria pencarian Anda. Coba perluas filter — misalnya naikkan budget atau cari di kota lain.`;

    setMessages(prev => prev.map(m =>
      m.id === loadingMsg.id
        ? { ...m, content: resultText, filters, properties, isLoading: false }
        : m
    ));
  }, [input, isProcessing, isListening, processNaturalLanguage, searchProperties]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Property Search</h1>
            <p className="text-xs text-muted-foreground">Cari properti dengan bahasa alami — powered by ASTRA AI</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 container mx-auto max-w-4xl px-4">
        <div ref={scrollRef} className="py-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Welcome state */}
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Halo! Saya asisten pencarian properti Anda 👋</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                Ceritakan properti impian Anda dalam bahasa sehari-hari, dan saya akan mencarikannya untuk Anda.
              </p>

              {/* Suggestion grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleSend(s)}
                    className="text-left text-xs p-3 rounded-xl border border-border/60 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all group"
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary mb-1.5 transition-colors" />
                    <span className="text-foreground group-hover:text-primary transition-colors">{s}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div className={cn(
                'max-w-[85%] md:max-w-[75%]',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5'
                  : 'space-y-3'
              )}>
                {msg.isLoading ? (
                  <div className="flex items-center gap-2 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Menganalisis pencarian Anda...</span>
                  </div>
                ) : msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <>
                    {/* Text response */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {/* Extracted filters */}
                    {msg.filters && <FilterChips filters={msg.filters} />}

                    {/* Property results grid */}
                    {msg.properties && msg.properties.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                        {msg.properties.map(p => (
                          <PropertyResultCard
                            key={p.id}
                            property={p}
                            onClick={() => navigate(`/property/${p.id}`)}
                          />
                        ))}
                      </div>
                    )}

                    {/* View all results link */}
                    {msg.properties && msg.properties.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => navigate('/search')}
                      >
                        Lihat semua hasil di halaman pencarian <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Mendengarkan...' : 'Ketik pencarian properti Anda...'}
                disabled={isProcessing}
                className={cn(
                  'pl-10 h-11 text-sm bg-card border-border/60 rounded-xl focus-visible:ring-primary/30',
                  supportsVoice ? 'pr-10' : 'pr-4',
                  isListening && 'border-destructive/50 ring-2 ring-destructive/20'
                )}
              />
              {supportsVoice && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={isProcessing}
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all',
                    isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={isProcessing || !input.trim()}
              size="icon"
              className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Contoh: "villa di bali di bawah 3 miliar" • "apartment jakarta 2 bedroom" • "properti investasi ROI tinggi"
          </p>
        </div>
      </div>
    </div>
  );
}
