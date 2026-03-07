import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDealFinder, DealFinderResult } from '@/hooks/useDealFinder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, Flame, TrendingUp, Eye, Bookmark, Building2, MapPin, ArrowRight, Sparkles, BarChart3, Search, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import ProfessionalFooter from '@/components/ProfessionalFooter';

const ratingConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  hot_deal: { label: 'Hot Deal', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Flame className="w-3 h-3" /> },
  good_deal: { label: 'Good Deal', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <TrendingUp className="w-3 h-3" /> },
  fair: { label: 'Fair', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <BarChart3 className="w-3 h-3" /> },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border', icon: <Target className="w-3 h-3" /> },
};

const formatPrice = (price: number) => {
  if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(1)}B`;
  if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
};

const DealCard = ({ deal, index }: { deal: DealFinderResult; index: number }) => {
  const navigate = useNavigate();
  const rating = ratingConfig[deal.deal_rating] || ratingConfig.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden">
            {deal.thumbnail_url ? (
              <img src={deal.thumbnail_url} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Building2 className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            {/* Score badge */}
            <div className="absolute top-3 left-3">
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${rating.color}`}>
                {rating.icon}
                {rating.label}
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-primary border border-primary/30">
              {deal.deal_score}/100
            </div>
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-5">
            <div className="flex flex-col h-full justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground text-base line-clamp-1 mb-1">{deal.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{deal.city || deal.location || 'Unknown'}</span>
                  {deal.property_type && (
                    <>
                      <span className="mx-1">·</span>
                      <span className="capitalize">{deal.property_type}</span>
                    </>
                  )}
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="bg-muted/50 rounded-lg p-2.5">
                    <span className="text-muted-foreground block mb-0.5">Price</span>
                    <span className="font-bold text-foreground text-sm">{formatPrice(deal.price)}</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5">
                    <span className="text-muted-foreground block mb-0.5">Undervalued</span>
                    <span className={`font-bold text-sm ${deal.undervalue_percent > 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {deal.undervalue_percent > 0 ? '+' : ''}{deal.undervalue_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5">
                    <span className="text-muted-foreground block mb-0.5">Rental Yield</span>
                    <span className="font-bold text-foreground text-sm">{deal.rental_yield_percent.toFixed(1)}%</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5">
                    <span className="text-muted-foreground block mb-0.5">Monthly Rent</span>
                    <span className="font-bold text-foreground text-sm">{formatPrice(deal.monthly_rent_estimate)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{deal.views_30d}</span>
                  <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{deal.saves_30d}</span>
                  <span>{deal.area_sqm}m²</span>
                  {deal.bedrooms && <span>{deal.bedrooms} bd</span>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:text-primary-foreground hover:bg-primary text-xs gap-1"
                  onClick={() => navigate(`/property/${deal.property_id}`)}
                >
                  View <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

const DealFinderPage = () => {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [minScore, setMinScore] = useState(0);

  const { data, isLoading, error } = useDealFinder({
    city: city || undefined,
    property_type: propertyType !== 'all' ? propertyType : undefined,
    min_score: minScore,
    limit: 30,
  });

  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation language={language} onLanguageToggle={toggleLanguage} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">ASTRA AI Deal Finder</h1>
              <p className="text-sm text-muted-foreground">AI-powered undervalued property detection engine</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-full sm:w-44 bg-background">
                  <SelectValue placeholder="Property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(minScore)} onValueChange={(v) => setMinScore(Number(v))}>
                <SelectTrigger className="w-full sm:w-40 bg-background">
                  <SelectValue placeholder="Min score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Scores</SelectItem>
                  <SelectItem value="30">Score ≥ 30</SelectItem>
                  <SelectItem value="50">Score ≥ 50</SelectItem>
                  <SelectItem value="70">Score ≥ 70</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats bar */}
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Properties Scanned', value: data.total_scanned },
              { label: 'Deals Found', value: data.total_deals_found },
              { label: 'Hot Deals', value: data.deals.filter(d => d.deal_rating === 'hot_deal').length },
              { label: 'Avg Deal Score', value: data.deals.length > 0 ? Math.round(data.deals.reduce((s, d) => s + d.deal_score, 0) / data.deals.length) : 0 },
            ].map((stat, i) => (
              <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Scanning properties for deals...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load deals</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
            </CardContent>
          </Card>
        )}

        {/* Deal list */}
        {data && (
          <div className="space-y-3">
            <AnimatePresence>
              {data.deals.map((deal, i) => (
                <DealCard key={deal.property_id} deal={deal} index={i} />
              ))}
            </AnimatePresence>
            {data.deals.length === 0 && !isLoading && (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No deals found matching your criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      <ProfessionalFooter language={language} />
    </div>
  );
};

export default DealFinderPage;
