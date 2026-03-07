import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Maximize, 
  TrendingUp, Flame, Star, MessageCircle, Phone 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { shareProperty } from '@/utils/shareUtils';

const MobilePropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ['mobile-property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch investment score
  const { data: investmentData } = useQuery({
    queryKey: ['mobile-investment-score', id],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'investment_score_v2', property_id: id },
      });
      return data?.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const formatPrice = (price: number) => {
    if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(2)} Miliar`;
    if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)} Juta`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-gold-primary';
    return 'text-destructive';
  };

  const gradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-500';
    if (grade.startsWith('B')) return 'bg-gold-primary';
    if (grade.startsWith('C')) return 'bg-amber-500';
    return 'bg-destructive';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-72 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const images = [
    property.thumbnail_url,
    ...(Array.isArray(property.images) ? property.images.slice(0, 4) : [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-72">
        <img
          src={images[0] || '/placeholder.svg'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        
        {/* Nav Bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center active:scale-95">
            <ArrowLeft className="h-4.5 w-4.5 text-white" />
          </button>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center active:scale-95">
              <Heart className="h-4.5 w-4.5 text-white" />
            </button>
            <button
              onClick={() => shareProperty(property.id, property.title)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center active:scale-95"
            >
              <Share2 className="h-4.5 w-4.5 text-white" />
            </button>
          </div>
        </div>

        {/* Image count */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-xs text-white">
            1/{images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 relative z-10">
        {/* Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border/40 p-4 shadow-lg mb-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPrice(property.price)}</p>
              {property.listing_type === 'rent' && (
                <span className="text-xs text-muted-foreground">/bulan</span>
              )}
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
              {property.listing_type === 'rent' ? 'Sewa' : 'Dijual'}
            </span>
          </div>
          <h1 className="text-base font-semibold text-foreground mb-1.5">{property.title}</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{[property.city, property.state].filter(Boolean).join(', ')}</span>
          </div>
        </motion.div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {property.bedrooms != null && (
            <div className="flex flex-col items-center p-3 rounded-xl bg-muted/40 border border-border/30">
              <Bed className="h-4.5 w-4.5 text-muted-foreground mb-1" />
              <span className="text-sm font-semibold text-foreground">{property.bedrooms}</span>
              <span className="text-[10px] text-muted-foreground">Bedrooms</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex flex-col items-center p-3 rounded-xl bg-muted/40 border border-border/30">
              <Bath className="h-4.5 w-4.5 text-muted-foreground mb-1" />
              <span className="text-sm font-semibold text-foreground">{property.bathrooms}</span>
              <span className="text-[10px] text-muted-foreground">Bathrooms</span>
            </div>
          )}
          {property.area_sqm != null && (
            <div className="flex flex-col items-center p-3 rounded-xl bg-muted/40 border border-border/30">
              <Maximize className="h-4.5 w-4.5 text-muted-foreground mb-1" />
              <span className="text-sm font-semibold text-foreground">{property.area_sqm}</span>
              <span className="text-[10px] text-muted-foreground">m²</span>
            </div>
          )}
        </div>

        {/* Investment Intelligence Card */}
        {investmentData && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4 mb-4 border border-border/40"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gold-primary) / 0.06), hsl(var(--gold-secondary) / 0.03))',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-gold-primary" />
              <h3 className="text-sm font-semibold text-foreground">Investment Intelligence</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-background/60 backdrop-blur rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Score</p>
                <p className={cn("text-xl font-bold", scoreColor(investmentData.overall_score || 0))}>
                  {investmentData.overall_score || 0}
                </p>
              </div>
              <div className="bg-background/60 backdrop-blur rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Grade</p>
                <span className={cn(
                  "inline-block px-2.5 py-0.5 rounded-full text-sm font-bold text-white",
                  gradeColor(investmentData.investment_grade || 'C')
                )}>
                  {investmentData.investment_grade || 'N/A'}
                </span>
              </div>
              {investmentData.rental_yield && (
                <div className="bg-background/60 backdrop-blur rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Rental Yield</p>
                  <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    {investmentData.rental_yield.toFixed(1)}%
                  </p>
                </div>
              )}
              {investmentData.demand_score && (
                <div className="bg-background/60 backdrop-blur rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Demand Heat</p>
                  <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
                    <Flame className={cn("h-3 w-3", investmentData.demand_score > 70 ? 'text-destructive' : 'text-amber-500')} />
                    {investmentData.demand_score}
                  </p>
                </div>
              )}
            </div>
            {investmentData.recommendations?.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                {investmentData.recommendations[0]}
              </p>
            )}
          </motion.div>
        )}

        {/* Description */}
        {property.description && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
              {property.description}
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-[80px] left-0 right-0 z-30 px-4 py-3 bg-background/95 backdrop-blur-xl border-t border-border/30"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/investment-assistant`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted border border-border/40 active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="h-4 w-4 text-gold-primary" />
            <span className="text-sm font-medium text-foreground">Ask AI</span>
          </button>
          <button className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-primary active:scale-[0.98] transition-transform">
            <Phone className="h-4 w-4 text-background" />
            <span className="text-sm font-bold text-background">Contact Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePropertyDetail;
