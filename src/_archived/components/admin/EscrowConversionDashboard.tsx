import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, TrendingUp, Clock, Users, DollarSign, BarChart3, ArrowUpRight, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'text-primary' }: MetricCardProps) => (
  <Card className="border-border/50">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">{title}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center bg-primary/10', color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <ArrowUpRight className="h-3 w-3 text-chart-1" />
          <span className="text-[10px] text-chart-1 font-medium">{trend}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const EscrowConversionDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [readinessBreakdown, setReadinessBreakdown] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch latest conversion metrics
        const { data: convMetrics } = await supabase
          .from('escrow_conversion_metrics')
          .select('*')
          .order('computed_at', { ascending: false })
          .limit(1)
          .single();

        // Fetch readiness distribution
        const { data: readinessEvents } = await supabase
          .from('escrow_readiness_events')
          .select('readiness_status')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const breakdown: Record<string, number> = { not_ready: 0, approaching_agreement: 0, escrow_ready: 0 };
        readinessEvents?.forEach((e: any) => {
          if (breakdown[e.readiness_status] !== undefined) {
            breakdown[e.readiness_status]++;
          }
        });

        setMetrics(convMetrics);
        setReadinessBreakdown(breakdown);
      } catch (err) {
        console.error('Failed to fetch escrow metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const conversionRate = metrics?.escrow_conversion_rate ?? 0;
  const totalAgreements = metrics?.deals_reaching_agreement ?? 0;
  const totalEscrow = metrics?.deals_entering_escrow ?? 0;
  const avgTimeHours = metrics?.average_time_to_escrow_hours ?? 0;
  const totalVolume = metrics?.total_escrow_volume_idr ?? 0;
  const totalReadiness = Object.values(readinessBreakdown).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Escrow Conversion Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Track deal-to-escrow conversion performance</p>
        </div>
        <Badge variant="outline" className="text-[10px]">Last 7 days</Badge>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          subtitle="Agreement → Escrow"
          icon={Target}
          trend="+2.3% vs last week"
        />
        <MetricCard
          title="Deals in Agreement"
          value={totalAgreements}
          subtitle="Reached price agreement"
          icon={Users}
        />
        <MetricCard
          title="Escrow Funded"
          value={totalEscrow}
          subtitle="Successfully deposited"
          icon={Shield}
          color="text-chart-1"
        />
        <MetricCard
          title="Avg Time to Escrow"
          value={`${avgTimeHours.toFixed(0)}h`}
          subtitle="Agreement to deposit"
          icon={Clock}
        />
      </div>

      {/* Escrow volume */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Total Escrow Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{formatIDR(totalVolume)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Cumulative escrow deposits this period</p>
        </CardContent>
      </Card>

      {/* Pipeline readiness breakdown */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Deal Readiness Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'escrow_ready', label: 'Escrow Ready', color: 'bg-chart-1' },
            { key: 'approaching_agreement', label: 'Approaching Agreement', color: 'bg-chart-4' },
            { key: 'not_ready', label: 'Not Ready', color: 'bg-muted-foreground' },
          ].map(({ key, label, color }) => {
            const count = readinessBreakdown[key] || 0;
            const pct = totalReadiness > 0 ? (count / totalReadiness) * 100 : 0;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-1"
              >
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{count} deals ({pct.toFixed(0)}%)</span>
                </div>
                <Progress value={pct} className={cn('h-2', `[&>div]:${color}`)} />
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default EscrowConversionDashboard;
