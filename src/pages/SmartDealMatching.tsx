import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain, Sparkles, Heart, Eye, TrendingUp, MapPin, DollarSign,
  ArrowRight, Bookmark, MessageSquare, BarChart3, Target, Zap,
  Shield, Activity, ChevronRight, Star, RefreshCw, Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

/* ---------------------------------------------------------------- */

interface MatchedDeal {
  id: string;
  title: string;
  location: string;
  price: string;
  matchScore: number;
  opportunityScore: number;
  image: string;
  reasons: string[];
  yieldEst: string;
  appreciation: string;
  type: string;
  isElite?: boolean;
}

const PRIMARY_MATCHES: MatchedDeal[] = [
  {
    id: '1', title: 'Oceanfront Villa Berawa', location: 'Canggu, Bali',
    price: 'Rp 8.2B', matchScore: 94, opportunityScore: 91,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    reasons: ['Strong rental yield alignment', 'Matches preferred growth locations', 'Within optimal budget range'],
    yieldEst: '8.4%', appreciation: '+14.2%', type: 'Villa', isElite: true,
  },
  {
    id: '2', title: 'Premium Apartment Sudirman', location: 'Jakarta CBD',
    price: 'Rp 4.5B', matchScore: 89, opportunityScore: 84,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    reasons: ['High demand corridor match', 'Portfolio diversification signal', 'Liquidity score above threshold'],
    yieldEst: '6.8%', appreciation: '+9.1%', type: 'Apartment',
  },
  {
    id: '3', title: 'Hillside Retreat Ubud', location: 'Ubud, Bali',
    price: 'Rp 6.1B', matchScore: 86, opportunityScore: 88,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    reasons: ['Matches lifestyle investment intent', 'Emerging area momentum detected', 'Consistent yield pattern'],
    yieldEst: '7.2%', appreciation: '+11.5%', type: 'Villa',
  },
];

const ALTERNATIVE_MATCHES: MatchedDeal[] = [
  {
    id: '4', title: 'Beachfront Land Lombok', location: 'Kuta, Lombok',
    price: 'Rp 3.8B', matchScore: 74, opportunityScore: 82,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    reasons: ['Higher risk-reward profile', 'Pre-infrastructure growth play'],
    yieldEst: '—', appreciation: '+22.0%', type: 'Land',
  },
  {
    id: '5', title: 'Commercial Unit BSD City', location: 'Tangerang',
    price: 'Rp 12.5B', matchScore: 71, opportunityScore: 79,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    reasons: ['Exceeds typical budget — high alpha potential', 'Institutional demand zone'],
    yieldEst: '9.1%', appreciation: '+7.8%', type: 'Commercial',
  },
];

const BEHAVIOR_SIGNALS = [
  { icon: Heart, label: 'Watchlist Patterns', detail: 'Villa-heavy, Bali-focused portfolio', value: 72 },
  { icon: Eye, label: 'Viewed Locations', detail: 'Canggu, Ubud, Seminyak — 23 views this week', value: 85 },
  { icon: DollarSign, label: 'Yield Preference', detail: 'Targeting 7%+ rental yield consistently', value: 90 },
  { icon: Target, label: 'Budget Signal', detail: 'Rp 5B – 10B optimal engagement range', value: 68 },
];

function MatchCard({ deal, index, isAlternative = false }: { deal: MatchedDeal; index: number; isAlternative?: boolean }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className={cn(
        'bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/20 transition-all',
        deal.isElite && 'ring-1 ring-primary/15'
      )}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={deal.image}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Match score */}
        <div className="absolute top-3 right-3">
          <div className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm',
            deal.matchScore >= 90 ? 'bg-primary/90 text-primary-foreground' : 'bg-card/80 text-foreground border border-border'
          )}>
            {deal.matchScore}% match
          </div>
        </div>

        {deal.isElite && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-primary-foreground text-[9px] gap-1">
              <Star className="w-2.5 h-2.5" />Elite
            </Badge>
          </div>
        )}

        {/* Bottom overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-semibold text-foreground">{deal.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" />{deal.location}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Price + scores */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground">{deal.price}</span>
          <Badge variant="outline" className="text-[10px] gap-1 px-2">
            <Zap className="w-3 h-3 text-primary" />{deal.opportunityScore}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-accent/50 rounded-lg p-2 text-center">
            <div className="text-[9px] text-muted-foreground">Est. Yield</div>
            <div className="text-xs font-semibold text-chart-1">{deal.yieldEst}</div>
          </div>
          <div className="bg-accent/50 rounded-lg p-2 text-center">
            <div className="text-[9px] text-muted-foreground">5Y Growth</div>
            <div className="text-xs font-semibold text-primary">{deal.appreciation}</div>
          </div>
        </div>

        {/* Match reasons */}
        <div className="space-y-1.5">
          {deal.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              <span>{r}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => navigate('/property-analysis')}>
            <BarChart3 className="w-3 h-3" />Deep Analysis
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <Bookmark className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SmartDealMatching() {
  const [isLearning, setIsLearning] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-chart-1/[0.02] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-[10px] border-primary/20 text-primary bg-primary/5">
              <Brain className="w-3 h-3 mr-1.5" />Powered by Behavioral AI
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              AI Deal Matching
              <span className="block text-primary">Engine</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-base">
              Personalized property opportunities based on your investment profile and activity.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Adaptive Learning Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-center gap-3 py-3 px-5 rounded-full bg-primary/5 border border-primary/10 w-fit mx-auto"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
          </motion.div>
          <span className="text-xs text-primary font-medium">
            AI continuously learning from your investment behavior
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </motion.div>

        {/* Behavior Signals */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-primary" />Your Behavior Signal Profile
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BEHAVIOR_SIGNALS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="bg-accent/40 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{s.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">{s.detail}</p>
                <div className="flex items-center gap-2">
                  <Progress value={s.value} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-mono text-muted-foreground">{s.value}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Primary Matches */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />Top Matched Deals
            </h2>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Flame className="w-3 h-3 text-primary" />{PRIMARY_MATCHES.length} opportunities
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRIMARY_MATCHES.map((deal, i) => (
              <MatchCard key={deal.id} deal={deal} index={i} />
            ))}
          </div>
        </div>

        {/* Alternative Strategic Matches */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-chart-4" />Alternative Strategic Matches
            </h2>
            <span className="text-[10px] text-muted-foreground">Higher risk · Higher return</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {ALTERNATIVE_MATCHES.map((deal, i) => (
              <MatchCard key={deal.id} deal={deal} index={i} isAlternative />
            ))}
          </div>
        </div>

        {/* Intelligence footer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Matches are refined every session based on your saves, views, and inquiry patterns.
            The more you explore, the smarter your feed becomes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
