import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import Price from '@/components/ui/Price';
import { usePropertyAdvisor, AdvisorRecommendation } from '@/hooks/usePropertyAdvisor';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Send, TrendingUp, Flame, Target,
  MapPin, BedDouble, Maximize2, Building2, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 60) return 'text-chart-1 bg-chart-1/10 border-chart-1/30';
  if (score >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  return 'text-muted-foreground bg-muted/50 border-border/50';
};

function PropertyCard({ rec, index, onView }: {
  rec: AdvisorRecommendation; index: number; onView: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group p-3 rounded-xl border border-border/30 bg-card/50 hover:bg-card/80 hover:border-primary/20 transition-all cursor-pointer"
      onClick={() => onView(rec.property_id)}
    >
      <div className="flex gap-3">
        {/* Image */}
        {rec.image_url && (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img src={rec.image_url} alt={rec.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{rec.title}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {rec.city}{rec.district ? `, ${rec.district}` : ''}
              </div>
            </div>
            <Badge className={cn('text-[9px] font-bold border flex-shrink-0', scoreColor(rec.composite_score))}>
              {rec.composite_score}
            </Badge>
          </div>

          {/* Price */}
          <p className="text-sm font-bold text-primary mt-1">
            <Price amount={rec.price} />
          </p>

          {/* Metrics */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <Target className="h-2.5 w-2.5 text-primary" />
              Inv: {rec.investment_score}
            </span>
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <Flame className="h-2.5 w-2.5 text-destructive" />
              Heat: {rec.demand_heat_score}
            </span>
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
              +{rec.forecast_growth}%/yr
            </span>
            {rec.bedrooms && (
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <BedDouble className="h-2.5 w-2.5" /> {rec.bedrooms}
              </span>
            )}
            {rec.area_sqm > 1 && (
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <Maximize2 className="h-2.5 w-2.5" /> {rec.area_sqm}m²
              </span>
            )}
          </div>
        </div>

        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

const PropertyAdvisorPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const advisor = usePropertyAdvisor();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (query.trim()) advisor.mutate(query.trim());
  };

  const data = advisor.data;

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card className="border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            ASTRA Property Advisor
          </CardTitle>
          <p className="text-[11px] text-muted-foreground mt-1">
            Ask in natural language — e.g. "Best villas in Bali under 5 miliar for investment"
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="What kind of property investment are you looking for?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={advisor.isPending || !query.trim()}
              size="sm"
              className="gap-1.5 px-4"
            >
              {advisor.isPending ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-foreground" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Advise
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Parsed Criteria Chips */}
            <div className="flex flex-wrap gap-1.5">
              {data.parsed_criteria.city && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <MapPin className="h-2.5 w-2.5" /> {data.parsed_criteria.city}
                </Badge>
              )}
              {data.parsed_criteria.property_type && (
                <Badge variant="outline" className="text-[10px] gap-1 capitalize">
                  <Building2 className="h-2.5 w-2.5" /> {data.parsed_criteria.property_type}
                </Badge>
              )}
              {data.parsed_criteria.max_price > 0 && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  Budget: <Price amount={data.parsed_criteria.max_price} short />
                </Badge>
              )}
              {data.parsed_criteria.investment_goal && (
                <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 capitalize">
                  {data.parsed_criteria.investment_goal.replace('_', ' ')}
                </Badge>
              )}
              {data.parsed_criteria.keywords?.map(kw => (
                <Badge key={kw} variant="secondary" className="text-[9px]">{kw}</Badge>
              ))}
            </div>

            {/* AI Summary */}
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">AI Investment Analysis</span>
                  <Badge variant="outline" className="text-[9px] ml-auto">
                    {data.total_found} found · {data.recommendations.length} ranked
                  </Badge>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                  <ReactMarkdown>{data.summary}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Top Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {data.recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No properties matched</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try broadening your search criteria</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[600px]">
                    <div className="space-y-2 pr-2">
                      {data.recommendations.map((rec, i) => (
                        <PropertyCard
                          key={rec.property_id}
                          rec={rec}
                          index={i}
                          onView={(id) => navigate(`/properties/${id}`)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyAdvisorPanel;
