import { useInvestorDNA, useComputeInvestorDNA, getDNARadarData, getPersonaMeta } from '@/hooks/useInvestorDNA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Dna, RefreshCw, Brain, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const InvestorDNAPanel = () => {
  const { data: dna, isLoading } = useInvestorDNA();
  const compute = useComputeInvestorDNA();

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!dna) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-6 text-center">
          <Dna className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Your Investor DNA profile hasn't been computed yet. Browse properties, save favorites, and search to build your profile.
          </p>
          <Button
            size="sm"
            onClick={() => compute.mutate()}
            disabled={compute.isPending}
          >
            {compute.isPending ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Brain className="w-3.5 h-3.5 mr-1.5" />}
            Compute My DNA
          </Button>
        </CardContent>
      </Card>
    );
  }

  const radarData = getDNARadarData(dna);
  const persona = getPersonaMeta(dna.investor_persona);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Dna className="w-4 h-4 text-primary" />
              Investor DNA
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] ${persona.color}`}>
                {persona.label}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => compute.mutate()}
                disabled={compute.isPending}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${compute.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">{persona.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Radar Chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="DNA"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive Journey */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-muted-foreground">Purchase Probability</span>
              </div>
              <p className="text-lg font-bold text-foreground">{Math.round(dna.probability_next_purchase * 100)}%</p>
              <Progress value={dna.probability_next_purchase * 100} className="h-1 mt-1" />
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="w-3 h-3 text-destructive" />
                <span className="text-[10px] text-muted-foreground">Churn Risk</span>
              </div>
              <p className="text-lg font-bold text-foreground">{Math.round(dna.churn_risk_score)}%</p>
              <Progress value={dna.churn_risk_score} className="h-1 mt-1" />
            </div>
          </div>

          {/* Key Preferences */}
          <div className="space-y-2">
            {dna.preferred_cities.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground w-14">Cities:</span>
                {dna.preferred_cities.slice(0, 4).map(c => (
                  <Badge key={c} variant="secondary" className="text-[9px] h-4 px-1.5">{c}</Badge>
                ))}
              </div>
            )}
            {dna.preferred_property_types.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground w-14">Types:</span>
                {dna.preferred_property_types.slice(0, 3).map(t => (
                  <Badge key={t} variant="secondary" className="text-[9px] h-4 px-1.5">{t}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* How we personalize */}
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-medium text-foreground">How we personalize for you</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Rankings, AI recommendations, and Copilot responses are tuned to your {persona.label.toLowerCase()} profile — emphasizing{' '}
              {dna.rental_income_pref_weight > 0.6 ? 'rental yield' : dna.capital_growth_pref_weight > 0.6 ? 'capital growth' : 'balanced returns'}
              {' '}with {dna.risk_tolerance_score > 65 ? 'higher' : dna.risk_tolerance_score < 35 ? 'lower' : 'moderate'} risk tolerance.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InvestorDNAPanel;
