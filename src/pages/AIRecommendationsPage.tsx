import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTracking } from "@/hooks/useUserTracking";
import OptimizedPropertyImage from "@/components/property/OptimizedPropertyImage";
import Price from "@/components/ui/Price";
import {
  Sparkles, MapPin, Home, TrendingUp, RefreshCw, Bed, Bath, Maximize,
  Brain, Filter, SlidersHorizontal, Target, Zap, Heart, Eye,
  ChevronDown, ChevronUp, BarChart3, Lightbulb, ArrowRight, Shield
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = ["All", "Bali", "Jakarta", "Surabaya", "Bandung", "Yogyakarta", "Semarang", "Makassar", "Medan", "Lombok"];
const PROPERTY_TYPES = ["All", "Villa", "Apartment", "House", "Land", "Commercial"];

const AIRecommendationsPage = () => {
  const { user } = useAuth();
  const { trackInteraction } = useUserTracking();
  const [showFilters, setShowFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [limit, setLimit] = useState(20);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ai-recommendations-page', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-match-engine-v2', {
        body: { limit },
      });
      if (error) throw error;

      const results = data?.results || [];
      if (results.length > 0 && results[0].property_id && !results[0].title) {
        const ids = results.map((r: any) => r.property_id);
        const scoreMap = new Map(results.map((r: any) => [r.property_id, {
          match_score: r.match_score || r.ai_match_score_v2 || 0,
          match_reasons: r.match_reasons || r.scoring_breakdown || {},
          buyer_type: r.buyer_type || 'balanced',
          confidence: r.ai_confidence_score || r.confidence || 0,
        }]));
        const { data: props } = await supabase
          .from('properties')
          .select('id, title, city, location, price, property_type, images, thumbnail_url, bedrooms, bathrooms, area_sqm, investment_score, description')
          .in('id', ids);

        return {
          recommendations: (props || []).map((p: any) => {
            const scores = (scoreMap.get(p.id) || { match_score: 0, match_reasons: {}, buyer_type: 'balanced', confidence: 0 }) as { match_score: number; match_reasons: any; buyer_type: string; confidence: number };
            return { ...p, match_score: scores.match_score, match_reasons: scores.match_reasons, buyer_type: scores.buyer_type, confidence: scores.confidence, image_url: p.thumbnail_url || (p.images && p.images[0]) || '/placeholder.svg' };
          }).sort((a: any, b: any) => b.match_score - a.match_score),
          userProfile: data?.user_ai_profile || {},
          buyerType: data?.buyer_type || 'balanced',
        };
      }

      return {
        recommendations: results.map((r: any) => ({
          id: r.property_id || r.id,
          title: r.title || 'Property',
          city: r.city || r.location || 'Indonesia',
          price: r.price || 0,
          property_type: r.property_type || 'House',
          image_url: r.image_url || r.thumbnail_url || '/placeholder.svg',
          match_score: r.match_score || r.ai_match_score_v2 || 0,
          match_reasons: r.match_reasons || r.scoring_breakdown || {},
          buyer_type: r.buyer_type || 'balanced',
          confidence: r.ai_confidence_score || r.confidence || 0,
          bedrooms: r.bedrooms || 0,
          bathrooms: r.bathrooms || 0,
          area_sqm: r.area_sqm || 0,
          investment_score: r.investment_score || 0,
          description: r.description || '',
        })),
        userProfile: data?.user_ai_profile || {},
        buyerType: data?.buyer_type || 'balanced',
      };
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!user) return <Navigate to="/auth" replace />;

  const allRecs = data?.recommendations || [];
  const userProfile = data?.userProfile;
  const buyerType = data?.buyerType || 'balanced';
  const loading = isLoading || isFetching;

  // Apply client-side filters
  const filtered = allRecs.filter((p: any) => {
    if (cityFilter !== "All" && p.city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (typeFilter !== "All" && p.property_type?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (p.match_score < minScore) return false;
    return true;
  });

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-chart-2' : s >= 60 ? 'text-primary' : 'text-muted-foreground';

  const scoreBg = (s: number) =>
    s >= 80 ? 'bg-chart-2/10 border-chart-2/30' : s >= 60 ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-border';

  const scoreLabel = (s: number) =>
    s >= 80 ? 'Excellent Match' : s >= 60 ? 'Good Match' : s >= 40 ? 'Fair Match' : 'Exploring';

  const buyerTypeInfo: Record<string, { icon: typeof Target; label: string; desc: string }> = {
    investor: { icon: BarChart3, label: 'Investor Profile', desc: 'High ROI & investment score focus' },
    lifestyle: { icon: Heart, label: 'Lifestyle Buyer', desc: 'Comfort, amenities & location focus' },
    balanced: { icon: Target, label: 'Balanced Buyer', desc: 'Mix of investment & lifestyle value' },
  };

  const profile = buyerTypeInfo[buyerType] || buyerTypeInfo.balanced;
  const ProfileIcon = profile.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Smart Recommendations</h1>
                  <p className="text-sm text-muted-foreground">Personalized property matches powered by machine learning</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                onClick={() => refetch()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Profile Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ProfileIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Profile</p>
                  <p className="font-semibold text-sm">{profile.label}</p>
                  <p className="text-[10px] text-muted-foreground">{profile.desc}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Matches Found</p>
                  <p className="font-semibold text-sm">{filtered.length} properties</p>
                  <p className="text-[10px] text-muted-foreground">
                    {filtered.filter((p: any) => p.match_score >= 80).length} excellent matches
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Confidence</p>
                  <p className="font-semibold text-sm">
                    {userProfile?.preferred_city ? 'High' : 'Learning'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {userProfile?.preferred_city ? `Based on ${userProfile.preferred_city} activity` : 'Interact more to improve'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b bg-muted/30"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">City</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Property Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Min Match Score: {minScore}%</Label>
                  <Slider
                    value={[minScore]}
                    onValueChange={([v]) => setMinScore(v)}
                    min={0} max={100} step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Results Limit</Label>
                  <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl overflow-hidden border">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((property: any, idx: number) => {
              const isExpanded = expandedCard === (property.id || property.property_id);
              const propId = property.id || property.property_id;

              return (
                <motion.div
                  key={propId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ${scoreBg(property.match_score)}`}>
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Link
                        to={`/property/${propId}`}
                        onClick={() => trackInteraction('property_view', { propertyId: propId, source: 'ai_recommendations_page' })}
                      >
                        <OptimizedPropertyImage
                          src={property.image_url || '/placeholder.svg'}
                          alt={property.title}
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

                      {/* Score Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`text-xs font-bold border-0 shadow-md gap-1 ${
                          property.match_score >= 80 ? 'bg-chart-2 text-chart-2-foreground'
                          : property.match_score >= 60 ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }`}>
                          <Sparkles className="h-3 w-3" />
                          {Math.round(property.match_score)}% Match
                        </Badge>
                      </div>

                      {/* Rank */}
                      <div className="absolute top-3 right-3">
                        <div className="h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border">
                          <span className="text-xs font-bold text-foreground">#{idx + 1}</span>
                        </div>
                      </div>

                      {/* Price overlay */}
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border">
                          <span className="text-sm font-bold text-foreground">
                            <Price amount={property.price || 0} short />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <Link to={`/property/${propId}`} className="hover:underline">
                          <h3 className="font-semibold text-foreground line-clamp-1">{property.title}</h3>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{property.city}</span>
                          <span className="mx-1">·</span>
                          <Home className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{property.property_type}</span>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {Number(property.bedrooms) > 0 && (
                          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.bedrooms}</span>
                        )}
                        {Number(property.bathrooms) > 0 && (
                          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms}</span>
                        )}
                        {Number(property.area_sqm) > 0 && (
                          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {property.area_sqm}m²</span>
                        )}
                        {Number(property.investment_score) > 0 && (
                          <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {property.investment_score}</span>
                        )}
                      </div>

                      {/* Match Quality Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${scoreColor(property.match_score)}`}>
                            {scoreLabel(property.match_score)}
                          </span>
                          <span className="text-muted-foreground">{Math.round(property.match_score)}/100</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              property.match_score >= 80 ? 'bg-chart-2'
                              : property.match_score >= 60 ? 'bg-primary'
                              : 'bg-muted-foreground'
                            }`}
                            style={{ width: `${Math.min(100, property.match_score)}%` }}
                          />
                        </div>
                      </div>

                      {/* Expand Match Reasons */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-xs"
                        onClick={() => setExpandedCard(isExpanded ? null : propId)}
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                        Why this matches you
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-2 border-t">
                              {property.match_reasons && typeof property.match_reasons === 'object' ? (
                                Object.entries(property.match_reasons).map(([key, value]: [string, any]) => (
                                  <div key={key} className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-primary rounded-full"
                                          style={{ width: `${Math.min(100, typeof value === 'number' ? value : 0)}%` }}
                                        />
                                      </div>
                                      <span className="font-medium text-foreground w-8 text-right">
                                        {typeof value === 'number' ? Math.round(value) : value}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Based on your browsing patterns, location preference, and budget range.
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* CTA */}
                      <Link to={`/property/${propId}`}>
                        <Button variant="outline" size="sm" className="w-full gap-2 mt-1">
                          <Eye className="h-3.5 w-3.5" />
                          View Property
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No matches found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or browse more properties to improve AI recommendations.
              </p>
              <Link to="/properties">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsPage;
