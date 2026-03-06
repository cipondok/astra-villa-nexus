import React, { useState } from 'react';
import { useAutonomousAgent, AgentStrategy } from '@/hooks/useAutonomousAgent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Bot, Send, TrendingUp, ShieldCheck, Shield, ShieldAlert,
  Building2, MapPin, ChevronDown, ChevronUp, Sparkles,
  Target, Wallet, BarChart3, AlertTriangle, Zap
} from 'lucide-react';

const formatRupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

const riskBadge = (risk: number) => {
  if (risk <= 35) return { label: 'Low Risk', color: 'text-chart-1', Icon: ShieldCheck };
  if (risk <= 60) return { label: 'Med Risk', color: 'text-chart-3', Icon: Shield };
  return { label: 'High Risk', color: 'text-destructive', Icon: ShieldAlert };
};

const StrategyCard: React.FC<{ strategy: AgentStrategy; rank: number }> = ({ strategy, rank }) => {
  const [expanded, setExpanded] = useState(rank === 0);
  const rb = riskBadge(strategy.avg_risk_factor);

  return (
    <Card className="border-border/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${rank === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            #{rank + 1}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{strategy.name}</p>
            <p className="text-[10px] text-muted-foreground">{strategy.properties.length} properties · {strategy.diversification.cities.length} cities</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-chart-1">{strategy.projected_roi}% ROI</p>
            <p className={`text-[10px] ${rb.color}`}>{rb.label}</p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <CardContent className="p-4 pt-0 space-y-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground">{strategy.description}</p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Investment</p>
              <p className="text-xs font-bold text-foreground">{formatRupiah(strategy.total_investment)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">5Y Value</p>
              <p className="text-xs font-bold text-chart-1">{formatRupiah(strategy.projected_value_5y)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Risk</p>
              <p className={`text-xs font-bold ${rb.color}`}>{strategy.avg_risk_factor}/100</p>
            </div>
          </div>

          <div className="space-y-2">
            {strategy.properties.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{p.city}</span>
                  </div>
                  <p className="text-xs font-bold text-primary mt-0.5">{formatRupiah(p.price)}</p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-[10px] text-chart-1 font-semibold">{p.roi_5y}% ROI</p>
                  <p className="text-[10px] text-muted-foreground">Yield {p.rental_yield}%</p>
                  <Badge variant="outline" className="text-[8px] capitalize">{p.deal_quality}</Badge>
                </div>
              </div>
            ))}
          </div>

          {strategy.diversification.cities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {strategy.diversification.cities.map((c) => (
                <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const AutonomousAgentPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');

  const agent = useAutonomousAgent();

  const handleRun = () => {
    agent.mutate({
      user_query: query || undefined,
      user_budget: budget ? parseInt(budget.replace(/\D/g, '')) : undefined,
      preferred_location: location || undefined,
      risk_tolerance: risk,
    });
  };

  const data = agent.data;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">ASTRA Autonomous Agent</h2>
          <p className="text-xs text-muted-foreground">AI-powered investment strategy engine</p>
        </div>
      </div>

      {/* Input form */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">What are you looking for?</label>
            <Input
              placeholder="e.g. I want to invest 5 miliar in Bali villas with good rental yield"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRun()}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Budget (IDR)</label>
              <Input
                placeholder="e.g. 5000000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</label>
              <Input
                placeholder="e.g. Bali"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">Risk Tolerance</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((r) => (
                <Button
                  key={r}
                  variant={risk === r ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRisk(r)}
                  className="flex-1 capitalize text-xs"
                >
                  {r === 'low' && <ShieldCheck className="h-3 w-3 mr-1" />}
                  {r === 'medium' && <Shield className="h-3 w-3 mr-1" />}
                  {r === 'high' && <Zap className="h-3 w-3 mr-1" />}
                  {r}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleRun} disabled={agent.isPending} className="w-full">
            {agent.isPending ? (
              <>Analyzing market...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Run Autonomous Agent</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {agent.isPending && (
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="mt-3 space-y-1 text-[10px] text-muted-foreground">
                <p>⏳ Parsing investment intent...</p>
                <p>⏳ Scanning property database...</p>
                <p>⏳ Running valuation & yield models...</p>
                <p>⏳ Building strategy portfolios...</p>
              </div>
            </CardContent>
          </Card>
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      )}

      {/* Error */}
      {agent.isError && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">Agent analysis failed. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && !agent.isPending && (
        <>
          {/* Intent badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              {data.intent.investment_goal.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Wallet className="h-3 w-3 mr-1" />
              Budget: {formatRupiah(data.intent.budget_max)}
            </Badge>
            {data.intent.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {data.intent.location}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              Risk: {data.intent.risk_tolerance}
            </Badge>
          </div>

          {/* AI Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary mb-1">ASTRA Agent Analysis</p>
                  <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{data.total_candidates} properties analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategies */}
          {data.strategies.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Investment Strategies ({data.strategies.length})
              </h3>
              {data.strategies.map((s, i) => (
                <StrategyCard key={s.name} strategy={s} rank={i} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">No strategies could be generated with current criteria.</p>
              </CardContent>
            </Card>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Generated {new Date(data.generated_at).toLocaleString('id-ID')} · ASTRA Autonomous Agent
          </p>
        </>
      )}
    </div>
  );
};

export default AutonomousAgentPanel;
