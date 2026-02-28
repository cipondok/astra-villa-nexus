import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Bed, Bath, Sparkles, User, ChevronDown, HelpCircle } from 'lucide-react';
import Price from '@/components/ui/Price';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ScoreBreakdown {
  type: number;
  location: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  features: number;
  userType: number;
  userCity: number;
  userPrice: number;
  userBedrooms: number;
  userFeatures: number;
}

interface RecommendedProperty {
  property: any;
  score: number;
  matchPercentage: number;
  reasons: string[];
  scoreBreakdown?: ScoreBreakdown;
}

interface PropertyRecommendationsProps {
  propertyId: string;
  propertyType?: string;
}

const getPropertyImage = (images?: string[], thumbnailUrl?: string, imageUrls?: string[]) => {
  if (images && images.length > 0) return images[0];
  if (imageUrls && imageUrls.length > 0) return imageUrls[0];
  if (thumbnailUrl) return thumbnailUrl;
  return '/placeholder.svg';
};

// formatPrice replaced by <Price /> component

const MatchBadge = ({ percentage }: { percentage: number }) => {
  const color = percentage >= 80 ? 'bg-chart-1/90' : percentage >= 60 ? 'bg-chart-2/90' : 'bg-muted';
  return (
    <span className={`absolute top-2 right-2 z-10 ${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm`}>
      {percentage}% Match
    </span>
  );
};

const breakdownConfig: { key: keyof ScoreBreakdown; label: string; max: number; category: 'content' | 'user' }[] = [
  { key: 'type', label: 'Property Type', max: 25, category: 'content' },
  { key: 'location', label: 'Location', max: 20, category: 'content' },
  { key: 'price', label: 'Price Range', max: 20, category: 'content' },
  { key: 'bedrooms', label: 'Bedrooms', max: 10, category: 'content' },
  { key: 'bathrooms', label: 'Bathrooms', max: 5, category: 'content' },
  { key: 'area', label: 'Area Size', max: 10, category: 'content' },
  { key: 'features', label: 'Features', max: 10, category: 'content' },
  { key: 'userType', label: 'Your Pref: Type', max: 15, category: 'user' },
  { key: 'userCity', label: 'Your Pref: Area', max: 15, category: 'user' },
  { key: 'userPrice', label: 'Your Pref: Budget', max: 10, category: 'user' },
  { key: 'userBedrooms', label: 'Your Pref: Rooms', max: 5, category: 'user' },
  { key: 'userFeatures', label: 'Your Pref: Amenities', max: 5, category: 'user' },
];

const ScoreBreakdownPanel = ({ breakdown, personalized }: { breakdown: ScoreBreakdown; personalized: boolean }) => {
  const contentItems = breakdownConfig.filter(c => c.category === 'content' && breakdown[c.key] > 0);
  const userItems = breakdownConfig.filter(c => c.category === 'user' && breakdown[c.key] > 0);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-2.5 pb-2.5 space-y-2">
        <div className="border-t border-border/30 pt-2 space-y-1.5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Property Match</p>
          {contentItems.map(item => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground w-16 sm:w-20 truncate">{item.label}</span>
              <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(breakdown[item.key] / item.max) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-semibold text-foreground w-8 text-right">
                {breakdown[item.key]}/{item.max}
              </span>
            </div>
          ))}
        </div>

        {personalized && userItems.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[9px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              <User className="h-2.5 w-2.5" />
              Personalized Boost
            </p>
            {userItems.map(item => (
              <div key={item.key} className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground w-16 sm:w-20 truncate">{item.label}</span>
                <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-1 rounded-full transition-all"
                    style={{ width: `${(breakdown[item.key] / item.max) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-semibold text-chart-1 w-8 text-right">
                  +{breakdown[item.key]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RecommendationSkeleton = () => (
  <div className="flex gap-3 overflow-hidden">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[160px] sm:w-[220px] rounded-xl border border-border/50 overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <div className="p-2.5 space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const PropertyRecommendations = ({ propertyId, propertyType }: PropertyRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalized, setPersonalized] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('property-recommendations', {
          body: { propertyId, userId: user?.id || null, limit: 6 },
        });
        if (!error && data?.recommendations) {
          setRecommendations(data.recommendations);
          setPersonalized(!!data.personalized);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) fetchRecommendations();
  }, [propertyId, user?.id]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm sm:text-lg font-bold text-foreground">Recommended For You</h2>
        </div>
        <RecommendationSkeleton />
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm sm:text-lg font-bold text-foreground">Recommended For You</h2>
        {personalized && (
          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary gap-1">
            <User className="h-2.5 w-2.5" />
            Personalized
          </Badge>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2">
        {recommendations.map((rec, index) => {
          const p = rec.property;
          // price rendered via <Price /> component
          const isExpanded = expandedId === p.id;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="flex-shrink-0 w-[180px] sm:w-[240px] border border-border/50 bg-card shadow-sm snap-start rounded-xl overflow-hidden group hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/properties/${p.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={getPropertyImage(p.images, p.thumbnail_url, p.image_urls)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <MatchBadge percentage={rec.matchPercentage} />
                  </div>

                  <div className="p-2.5 space-y-1.5">
                    <div className="border border-border/40 bg-primary/5 dark:bg-primary/10 rounded-lg px-2 py-1.5">
                      <span className="text-sm sm:text-base font-black text-primary tracking-tight leading-none">
                        <Price amount={p.price} short showFlag />
                      </span>
                    </div>

                    <h4 className="font-semibold text-[11px] sm:text-xs line-clamp-2 leading-snug group-hover:text-primary transition-colors">{p.title}</h4>

                    <div className="flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-primary" />
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium line-clamp-1">{p.location}</span>
                    </div>

                    {/* Match reason tags */}
                    <div className="flex flex-wrap gap-1">
                      {rec.reasons.slice(0, 3).map((reason, i) => (
                        <Badge key={i} variant="secondary" className="text-[8px] px-1.5 py-0 h-4 font-medium">
                          {reason}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 pt-1.5 border-t border-border/30">
                      {p.bedrooms > 0 && (
                        <div className="flex items-center gap-1 border border-border/40 bg-primary/5 dark:bg-primary/10 rounded-lg px-2 py-0.5">
                          <Bed className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-foreground font-bold">{p.bedrooms}</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">KT</span>
                        </div>
                      )}
                      {p.bathrooms > 0 && (
                        <div className="flex items-center gap-1 border border-border/40 bg-primary/5 dark:bg-primary/10 rounded-lg px-2 py-0.5">
                          <Bath className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-foreground font-bold">{p.bathrooms}</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">KM</span>
                        </div>
                      )}
                      {p.area_sqm && (
                        <div className="flex items-center gap-1 border border-border/40 bg-accent/5 dark:bg-accent/10 rounded-lg px-2 py-0.5">
                          <span className="text-[9px] text-accent font-bold">LB</span>
                          <span className="text-[10px] text-foreground font-bold">{p.area_sqm}m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Why this match? toggle */}
                {rec.scoreBreakdown && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : p.id);
                      }}
                      className={cn(
                        'w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium transition-colors border-t border-border/30',
                        isExpanded
                          ? 'text-primary bg-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      )}
                    >
                      <HelpCircle className="h-3 w-3" />
                      Why this match?
                      <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <ScoreBreakdownPanel breakdown={rec.scoreBreakdown} personalized={personalized} />
                      )}
                    </AnimatePresence>
                  </>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyRecommendations;
