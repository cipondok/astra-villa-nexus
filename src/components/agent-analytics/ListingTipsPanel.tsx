import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useListingTips, ListingTip } from '@/hooks/useListingTips';
import { 
  Sparkles, AlertTriangle, Image, DollarSign, FileText, 
  Type, Settings, ChevronRight, ArrowUpRight, X, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tipTypeIcon: Record<string, React.ElementType> = {
  description: FileText,
  photos: Image,
  price: DollarSign,
  title: Type,
  features: Settings,
};

const priorityConfig = {
  high: { color: 'text-destructive bg-destructive/10 border-destructive/30', label: 'High Impact' },
  medium: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', label: 'Medium' },
  low: { color: 'text-primary bg-primary/10 border-primary/30', label: 'Nice to Have' },
};

const ListingTipsPanel: React.FC = () => {
  const { tips, summary, isLoading } = useListingTips();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string | null>(null);

  const visibleTips = tips
    .filter(t => !dismissedIds.has(t.id))
    .filter(t => !filterType || t.tip_type === filterType);

  const dismissTip = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Analyzing your listings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Listing Improvement Tips</h3>
                <p className="text-xs text-muted-foreground">
                  {summary.propertiesAnalyzed} listings analyzed · {summary.total} suggestions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {summary.high > 0 && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />{summary.high} urgent
                </Badge>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Button
              variant={filterType === null ? 'default' : 'outline'}
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => setFilterType(null)}
            >
              All ({summary.total})
            </Button>
            {['description', 'photos', 'price', 'title', 'features'].map(type => {
              const count = tips.filter(t => t.tip_type === type && !dismissedIds.has(t.id)).length;
              if (count === 0) return null;
              const Icon = tipTypeIcon[type];
              return (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 text-[10px] px-2 capitalize"
                  onClick={() => setFilterType(filterType === type ? null : type)}
                >
                  <Icon className="h-3 w-3 mr-0.5" />
                  {type} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleTips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-card/80 border-border/50">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-10 w-10 text-chart-1/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-chart-1">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">Your listings are well-optimized. Keep up the great work!</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            visibleTips.map((tip, i) => {
              const Icon = tipTypeIcon[tip.tip_type] || FileText;
              const pConfig = priorityConfig[tip.priority];
              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                >
                  <Card className="bg-card/80 border-border/50 hover:border-primary/30 transition-colors group">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${pConfig.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm">{tip.tip_title}</span>
                            <Badge className={`text-[9px] px-1.5 py-0 ${pConfig.color}`}>
                              {pConfig.label}
                            </Badge>
                            {tip.impact && (
                              <Badge className="text-[9px] px-1.5 py-0 bg-chart-1/10 text-chart-1 border-chart-1/30">
                                <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                                {tip.impact}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip_description}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                            <ChevronRight className="h-2.5 w-2.5" />
                            {tip.property_title || 'Unknown Property'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => dismissTip(tip.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ListingTipsPanel;
