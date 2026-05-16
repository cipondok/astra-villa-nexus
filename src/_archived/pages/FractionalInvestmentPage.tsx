import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useFractionalInvestments, useFractionalPortfolio, type FractionalListing } from '@/hooks/useFractionalInvestments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  ArrowLeft, Coins, TrendingUp, PieChart, Shield, Building2,
  BarChart3, Users, Wallet, Sparkles, ChevronRight, Lock,
  Target, DollarSign, LineChart, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  funding: { label: 'Funding', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  funded: { label: 'Fully Funded', color: 'bg-primary/15 text-primary border-primary/30' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground border-border' },
};

const demandBadge: Record<string, string> = {
  very_high: '🔥 Very High Demand',
  high: '📈 High Demand',
  moderate: '📊 Moderate',
  low: '💎 Exclusive',
};

// --- Opportunity Card ---
const FractionalOpportunityCard = ({ listing, onSelect }: { listing: FractionalListing; onSelect: (l: FractionalListing) => void }) => {
  const soldPct = listing.total_tokens > 0 ? (listing.tokens_sold / listing.total_tokens) * 100 : 0;
  const sc = statusConfig[listing.status] || statusConfig.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group cursor-pointer" onClick={() => onSelect(listing)}>
        {/* Image */}
        <div className="relative h-44 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 overflow-hidden">
          {listing.thumbnail_url ? (
            <img src={listing.thumbnail_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-16 w-16 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <Badge className={`absolute top-3 left-3 ${sc.color} border text-xs`}>{sc.label}</Badge>
          <Badge variant="outline" className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm text-xs border-border/50">
            {demandBadge[listing.investor_demand]}
          </Badge>
          {/* Yield badge */}
          <div className="absolute bottom-3 right-3 bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
            {listing.yield_pct}% Yield
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
            <p className="text-xs text-muted-foreground">{listing.location}</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Property Value</p>
              <p className="text-sm font-bold text-foreground">{fmt(listing.property_value)}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min. Investment</p>
              <p className="text-sm font-bold text-primary">{fmt(listing.min_investment)}</p>
            </div>
          </div>

          {/* Funding progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{listing.tokens_sold}/{listing.total_tokens} tokens sold</span>
              <span className="font-medium text-foreground">{soldPct.toFixed(0)}%</span>
            </div>
            <Progress value={soldPct} className="h-1.5" />
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>+{listing.appreciation_forecast_pct}% forecast</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <span>Details</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- Detail Dialog ---
const InvestmentDetailDialog = ({ listing, open, onClose }: { listing: FractionalListing | null; open: boolean; onClose: () => void }) => {
  if (!listing) return null;
  const soldPct = listing.total_tokens > 0 ? (listing.tokens_sold / listing.total_tokens) * 100 : 0;

  const handleSubmitInterest = () => {
    toast.success('Investment interest submitted! Our team will contact you shortly.', { duration: 5000 });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{listing.title}</DialogTitle>
          <DialogDescription>{listing.location} · {fmt(listing.property_value)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Share Structure Visualization */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Ownership Share Structure</span>
              </div>
              {/* Visual donut representation */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="12"
                      strokeDasharray={`${soldPct * 2.51} ${251 - soldPct * 2.51}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{soldPct.toFixed(0)}%</span>
                    <span className="text-[10px] text-muted-foreground">Sold</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tokens</span>
                    <span className="font-semibold text-foreground">{listing.total_tokens.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Token Price</span>
                    <span className="font-semibold text-foreground">{fmt(listing.token_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-semibold text-emerald-400">{(listing.total_tokens - listing.tokens_sold).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Return/Token</span>
                    <span className="font-semibold text-primary">{fmt(listing.projected_annual_return_per_token)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Rental Yield</p>
              <p className="text-lg font-bold text-foreground">{listing.yield_pct}%</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
              <p className="text-xs text-muted-foreground">Appreciation</p>
              <p className="text-lg font-bold text-foreground">+{listing.appreciation_forecast_pct}%</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Target className="h-5 w-5 mx-auto text-amber-400 mb-1" />
              <p className="text-xs text-muted-foreground">Total Return</p>
              <p className="text-lg font-bold text-foreground">{(listing.yield_pct + listing.appreciation_forecast_pct).toFixed(1)}%</p>
            </div>
          </div>

          {/* Fractional Structure Description */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Coins className="h-3 w-3" /> Fractional Structure</p>
              <p className="text-sm text-foreground leading-relaxed">{listing.fractional_structure}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><LineChart className="h-3 w-3" /> Liquidity Model</p>
              <p className="text-sm text-foreground leading-relaxed">{listing.liquidity_model}</p>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-400">Compliance Notice</p>
              <p className="text-xs text-muted-foreground mt-0.5">This is a conceptual investment model. Actual participation is subject to OJK regulatory approval and platform verification.</p>
            </div>
          </div>

          {/* CTA */}
          <Button className="w-full" size="lg" onClick={handleSubmitInterest} disabled={listing.status === 'closed' || listing.status === 'funded'}>
            <Sparkles className="h-4 w-4 mr-2" />
            {listing.status === 'funded' ? 'Fully Funded' : listing.status === 'closed' ? 'Closed' : 'Submit Investment Interest'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Portfolio Tab ---
const PortfolioTab = () => {
  const { data: holdings = [], isLoading } = useFractionalPortfolio();
  const totalInvested = holdings.reduce((s, h) => s + h.total_invested, 0);
  const totalValue = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalMonthlyIncome = holdings.reduce((s, h) => s + h.projected_monthly_income, 0);
  const overallGain = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Wallet, label: 'Total Invested', value: fmt(totalInvested), color: 'text-primary' },
          { icon: BarChart3, label: 'Current Value', value: fmt(totalValue), color: 'text-emerald-400' },
          { icon: TrendingUp, label: 'Total Gain', value: `+${overallGain.toFixed(1)}%`, color: 'text-emerald-400' },
          { icon: DollarSign, label: 'Monthly Income', value: fmt(totalMonthlyIncome), color: 'text-amber-400' },
        ].map((s, i) => (
          <Card key={i} className="border-border/50 bg-card/80">
            <CardContent className="p-3">
              <s.icon className={`h-4 w-4 ${s.color} mb-1`} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Holdings List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Your Holdings</h3>
        {holdings.map((h, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{h.title}</h4>
                    <p className="text-xs text-muted-foreground">{h.tokens_held} tokens · {fmt(h.token_price)}/token</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">+{h.gain_pct}%</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Invested</p>
                    <p className="text-xs font-semibold text-foreground">{fmt(h.total_invested)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Current Value</p>
                    <p className="text-xs font-semibold text-emerald-400">{fmt(h.current_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Monthly Income</p>
                    <p className="text-xs font-semibold text-primary">{fmt(h.projected_monthly_income)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main Page ---
const FractionalInvestmentPage = () => {
  const { user, loading } = useAuth();
  const { data: listings = [], isLoading } = useFractionalInvestments();
  const [selected, setSelected] = useState<FractionalListing | null>(null);
  const [filter, setFilter] = useState<string>('all');

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link to="/user-dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Fractional Property Investment</h1>
              <p className="text-sm text-muted-foreground">Invest in premium properties with smaller capital entry</p>
            </div>
          </div>
        </div>

        {/* Trust Banner */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-6">
              {[
                { icon: Shield, text: 'OJK Compliant Design' },
                { icon: Lock, text: 'Smart Contract Ready' },
                { icon: CheckCircle2, text: 'Verified Properties' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <t.icon className="h-3.5 w-3.5 text-primary" />
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Conceptual model — subject to regulatory approval</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="opportunities" className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Opportunities</TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-1.5"><PieChart className="h-3.5 w-3.5" /> My Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities">
            {/* Status Filters */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'open', label: 'Open' },
                { key: 'funding', label: 'Funding' },
                { key: 'funded', label: 'Funded' },
              ].map(f => (
                <Button key={f.key} variant={filter === f.key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f.key)} className="text-xs">
                  {f.label}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>
            ) : filtered.length === 0 ? (
              <Card className="border-border/50"><CardContent className="py-12 text-center text-muted-foreground">No opportunities found for this filter.</CardContent></Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(l => (
                  <FractionalOpportunityCard key={l.id} listing={l} onSelect={setSelected} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioTab />
          </TabsContent>
        </Tabs>

        <InvestmentDetailDialog listing={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
};

export default FractionalInvestmentPage;
