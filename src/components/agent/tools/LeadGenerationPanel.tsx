import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Price from '@/components/ui/Price';
import { useLeadGeneration, BuyerLead } from '@/hooks/useLeadGeneration';
import {
  Search, Users, Flame, TrendingUp, Target,
  Zap, UserCheck, DollarSign, Activity, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const intentColor = (score: number) => {
  if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 80) return 'text-chart-1 bg-chart-1/10 border-chart-1/30';
  return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
};

const buyerTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    investor: 'bg-primary/10 text-primary border-primary/30',
    lifestyle: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
    balanced: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  };
  return map[type] || 'bg-muted text-muted-foreground';
};

function LeadRow({ lead, index }: { lead: BuyerLead; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors border border-border/30"
    >
      {/* Score */}
      <div className={cn(
        'w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border',
        intentColor(lead.intent_score)
      )}>
        {lead.intent_score}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono text-muted-foreground truncate">
            {lead.user_id.slice(0, 8)}…
          </span>
          <Badge className={cn('text-[9px] px-1.5 py-0', buyerTypeBadge(lead.buyer_type))}>
            {lead.buyer_type}
          </Badge>
          {lead.intent_score >= 90 && <Flame className="h-3 w-3 text-destructive" />}
        </div>
        <div className="flex items-center gap-3">
          {lead.preferred_budget && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <DollarSign className="h-2.5 w-2.5" />
              <Price amount={lead.preferred_budget} short />
            </span>
          )}
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Activity className="h-2.5 w-2.5" />
            {lead.activity_30d.views}v · {lead.activity_30d.saves}s · {lead.activity_30d.inquiries}i
          </span>
          {lead.last_active_at && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatDistanceToNow(new Date(lead.last_active_at), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="w-16 hidden sm:block">
        <Progress value={lead.intent_score} className="h-1.5" />
      </div>
    </motion.div>
  );
}

const LeadGenerationPanel: React.FC = () => {
  const [city, setCity] = useState('');
  const { mutate, data, isPending } = useLeadGeneration();

  const handleSearch = () => {
    if (city.trim()) mutate(city.trim());
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>
            AI Lead Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city (e.g. Jakarta, Bali, Surabaya)"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="text-sm"
            />
            <Button
              onClick={handleSearch}
              disabled={isPending || !city.trim()}
              size="sm"
              className="gap-1.5 px-4"
            >
              {isPending ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-foreground" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'High-Intent Leads', value: data.total_high_intent, icon: Flame, color: 'text-destructive' },
              { label: 'Total Scanned', value: data.total_scanned, icon: Users, color: 'text-primary' },
              { label: 'Avg Intent Score', value: data.avg_intent_score, icon: TrendingUp, color: 'text-chart-1' },
              { label: 'City Agents', value: data.matched_agents.length, icon: UserCheck, color: 'text-amber-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-card/60 border-border/50">
                  <CardContent className="p-3 text-center">
                    <stat.icon className={cn('h-4 w-4 mx-auto mb-1', stat.color)} />
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Budget Range */}
          {data.budget_range && (
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Budget Range</span>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Price amount={data.budget_range.min} short />
                  <span className="text-muted-foreground">—</span>
                  <Price amount={data.budget_range.max} short />
                  <Badge variant="outline" className="text-[9px] ml-2">
                    avg <Price amount={data.budget_range.avg} short />
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead List */}
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Buyer Leads — {data.city}
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] ml-auto">
                  {data.total_high_intent} leads
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.buyer_leads.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No high-intent leads found for {data.city}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try a different city or check back later</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-2 pr-2">
                    <AnimatePresence>
                      {data.buyer_leads.map((lead, i) => (
                        <LeadRow key={lead.user_id} lead={lead} index={i} />
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default LeadGenerationPanel;
