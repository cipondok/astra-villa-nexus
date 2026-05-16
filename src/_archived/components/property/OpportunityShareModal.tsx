import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Copy, MessageCircle, Send, Facebook, Twitter,
  Check, Sparkles, TrendingUp, MapPin, X, Image as ImageIcon,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import OpportunityScoreRing from './OpportunityScoreRing';
import { cn } from '@/lib/utils';

interface OpportunityShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: string;
    title: string;
    price?: number;
    location?: string;
    image_url?: string;
    opportunity_score?: number | null;
    bedrooms?: number;
    bathrooms?: number;
    land_area?: number;
    price_trend?: 'up' | 'down' | 'stable';
    ai_insight?: string;
  };
}

const SHARE_CHANNELS = [
  { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20', buildUrl: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}` },
  { key: 'telegram', name: 'Telegram', icon: Send, color: 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20', buildUrl: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20', buildUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { key: 'twitter', name: 'X', icon: Twitter, color: 'bg-foreground/5 text-foreground hover:bg-foreground/10', buildUrl: (url: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  { key: 'linkedin', name: 'LinkedIn', icon: Send, color: 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20', buildUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
];

export default function OpportunityShareModal({ open, onOpenChange, property }: OpportunityShareModalProps) {
  const { user } = useAuth();
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const formatPrice = getCurrencyFormatterShort();

  const { data: referralCode } = useQuery({
    queryKey: ['user-referral-code', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('affiliates')
        .select('referral_code')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      return data?.referral_code || null;
    },
    enabled: !!user?.id,
  });

  const buildShareUrl = (channel: string) => {
    const base = `${window.location.origin}/properties/${property.id}`;
    const params = new URLSearchParams();
    if (referralCode) params.set('ref', referralCode);
    params.set('utm_source', channel);
    params.set('utm_medium', 'social');
    params.set('utm_campaign', 'opportunity_share');
    return `${base}?${params.toString()}`;
  };

  const defaultMessage = property.opportunity_score && property.opportunity_score >= 80
    ? `🔥 Elite investment opportunity! Score: ${property.opportunity_score}/100 — ${property.title}`
    : `Check out this investment opportunity: ${property.title}`;

  const shareText = customMessage || defaultMessage;

  const trackShare = async (channel: string) => {
    try {
      await supabase.from('property_shares' as any).insert({
        user_id: user?.id || null,
        property_id: property.id,
        channel,
        referral_code: referralCode || null,
      });
    } catch { /* silent */ }
  };

  const handleCopyLink = async () => {
    const url = buildShareUrl('copy');
    const fullText = `${shareText}\n${url}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      trackShare('copy');
      toast({ title: '✅ Link Copied!', description: 'Share it with potential investors' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleSocialShare = (channel: typeof SHARE_CHANNELS[number]) => {
    const url = buildShareUrl(channel.key);
    window.open(channel.buildUrl(url, shareText), '_blank', 'width=600,height=400');
    trackShare(channel.key);
    setShared(true);
    setTimeout(() => {
      setShared(false);
    }, 3000);
  };

  const scoreTier = property.opportunity_score && property.opportunity_score >= 80
    ? 'elite' : property.opportunity_score && property.opportunity_score >= 60
    ? 'good' : 'moderate';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/50">
        {/* Snapshot Card Preview */}
        <div className="relative">
          {/* Hero Image */}
          <div className="relative h-44 sm:h-52 bg-muted overflow-hidden">
            {property.image_url ? (
              <img
                src={property.image_url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Opportunity Score Badge — top right */}
            {property.opportunity_score && property.opportunity_score > 0 && (
              <div className="absolute top-3 right-3 z-10">
                <OpportunityScoreRing score={property.opportunity_score} size={52} />
              </div>
            )}

            {/* Price + Location — bottom */}
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <h3 className="text-white font-bold text-sm sm:text-base leading-tight line-clamp-2 drop-shadow-lg">
                {property.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {property.price && (
                  <Badge className="bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg">
                    {formatPrice(property.price)}
                  </Badge>
                )}
                {property.location && (
                  <span className="text-white/80 text-[11px] flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {property.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price Insight Strip */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-primary/[0.06] to-accent/[0.04] border-b border-border/30">
            <div className="flex items-center gap-3 flex-wrap">
              {property.opportunity_score && property.opportunity_score >= 80 && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-chart-2" />
                  <span className="text-[11px] font-semibold text-chart-2">Elite Opportunity</span>
                </div>
              )}
              {property.price_trend && (
                <div className="flex items-center gap-1">
                  <TrendingUp className={cn('h-3.5 w-3.5', property.price_trend === 'up' ? 'text-chart-2' : property.price_trend === 'down' ? 'text-destructive' : 'text-muted-foreground')} />
                  <span className="text-[11px] text-muted-foreground capitalize">Price {property.price_trend}</span>
                </div>
              )}
              {property.bedrooms && (
                <span className="text-[11px] text-muted-foreground">{property.bedrooms} BR</span>
              )}
              {property.land_area && (
                <span className="text-[11px] text-muted-foreground">{property.land_area} m²</span>
              )}
              {property.ai_insight && (
                <span className="text-[11px] text-muted-foreground italic truncate max-w-[200px]">{property.ai_insight}</span>
              )}
            </div>
          </div>
        </div>

        {/* Message Customization */}
        <div className="px-4 pt-3 pb-2">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Personalize your message
          </label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={defaultMessage}
            className="min-h-[60px] text-sm resize-none border-border/50 focus-visible:ring-primary/30"
            maxLength={280}
          />
          <p className="text-[10px] text-muted-foreground text-right mt-0.5">
            {(customMessage || defaultMessage).length}/280
          </p>
        </div>

        {/* Share Channels */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {SHARE_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <motion.button
                  key={channel.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSocialShare(channel)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    channel.color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {channel.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Copy Link + Success */}
        <div className="px-4 pb-4 flex gap-2">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="flex-1 gap-2 border-primary/30 hover:bg-primary/5"
          >
            {copied ? <Check className="h-4 w-4 text-chart-2" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Referral Link'}
          </Button>
        </div>

        {/* Share Success Feedback */}
        <AnimatePresence>
          {shared && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-4 right-4 bg-chart-2/10 border border-chart-2/30 rounded-lg p-3 flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-medium text-chart-2">Shared successfully! Your referral is being tracked.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
