import { motion } from 'framer-motion';
import {
  Rocket, Server, Building2, TrendingUp, Headphones,
  CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw,
  Shield, ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useLaunchReadiness, type CheckSection, type CheckItem, type CheckStatus } from '@/hooks/useLaunchReadiness';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

const SECTION_ICONS: Record<string, React.ElementType> = {
  server: Server,
  building: Building2,
  trending: TrendingUp,
  headset: Headphones,
};

const STATUS_CONFIG: Record<CheckStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pass: { icon: CheckCircle2, color: 'text-chart-2', bg: 'bg-chart-2/10', label: 'Pass' },
  warning: { icon: AlertTriangle, color: 'text-chart-4', bg: 'bg-chart-4/10', label: 'Warning' },
  fail: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Fail' },
  pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted/20', label: 'Pending' },
};

const GO_CONFIG = {
  go: { color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/30', label: 'GO', description: 'All critical checks pass — clear for launch' },
  conditional: { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30', label: 'CONDITIONAL', description: 'No blockers but pending items need resolution' },
  no_go: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'NO-GO', description: 'Critical blockers must be resolved before launch' },
};

export default function LaunchReadinessPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useLaunchReadiness();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const go = GO_CONFIG[data.go_decision];
  const totalItems = data.sections.flatMap(s => s.items).length;
  const passCount = data.sections.flatMap(s => s.items).filter(i => i.status === 'pass').length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-5 w-5 text-chart-4" />
            Launch Readiness Checklist
          </h1>
          <p className="text-xs text-muted-foreground">
            Operational checklist for public launch · Updated {dataUpdatedAt ? format(new Date(dataUpdatedAt), 'MMM d, HH:mm') : '—'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Go/No-Go Decision Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <Card className={cn('border-border/40 overflow-hidden', go.border)}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
            {/* Gauge */}
            <div className="w-28 h-28 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%" innerRadius="68%" outerRadius="100%"
                  startAngle={180} endAngle={0}
                  data={[{ value: data.launch_confidence, fill: data.go_decision === 'go' ? 'hsl(var(--chart-2))' : data.go_decision === 'conditional' ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))' }]}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'hsl(var(--muted))' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <p className="text-lg font-bold text-foreground">{data.launch_confidence}%</p>
                <p className="text-[8px] text-muted-foreground">CONFIDENCE</p>
              </div>
            </div>

            {/* Decision */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Badge className={cn('text-sm font-bold px-3 py-0.5', go.bg, go.color, go.border)}>
                  {go.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{passCount}/{totalItems} checks passed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{go.description}</p>

              {/* Section scores */}
              <div className="flex flex-wrap gap-2 mt-3">
                {data.sections.map(sec => {
                  const Icon = SECTION_ICONS[sec.icon] || Shield;
                  return (
                    <div key={sec.id} className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/20 border border-border/30">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[9px] font-medium text-foreground">{sec.title}</span>
                      <Badge variant="outline" className={cn('text-[8px] h-3.5 ml-0.5',
                        sec.score >= 80 ? 'text-chart-2 border-chart-2/30' :
                        sec.score >= 50 ? 'text-chart-4 border-chart-4/30' : 'text-destructive border-destructive/30'
                      )}>
                        {sec.score}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Blockers Banner */}
      {data.blockers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-xs font-bold text-destructive">Launch Blockers ({data.blockers.length})</span>
              </div>
              <div className="space-y-1">
                {data.blockers.map((b, i) => (
                  <p key={i} className="text-[11px] text-destructive/80 pl-6">• {b}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Checklist Sections */}
      {data.sections.map((section, i) => (
        <SectionCard key={section.id} section={section} delay={0.12 + i * 0.06} />
      ))}
    </div>
  );
}

function SectionCard({ section, delay }: { section: CheckSection; delay: number }) {
  const [open, setOpen] = useState(true);
  const Icon = SECTION_ICONS[section.icon] || Shield;
  const passed = section.items.filter(i => i.status === 'pass').length;
  const failed = section.items.filter(i => i.status === 'fail').length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className={cn('border-border/40', failed > 0 && 'border-destructive/20')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 pt-3 px-4 cursor-pointer hover:bg-muted/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center',
                    section.score >= 80 ? 'bg-chart-2/10' : section.score >= 50 ? 'bg-chart-4/10' : 'bg-destructive/10'
                  )}>
                    <Icon className={cn('h-4 w-4',
                      section.score >= 80 ? 'text-chart-2' : section.score >= 50 ? 'text-chart-4' : 'text-destructive'
                    )} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{section.title}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{passed}/{section.items.length} checks passed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-lg font-bold',
                    section.score >= 80 ? 'text-chart-2' : section.score >= 50 ? 'text-chart-4' : 'text-destructive'
                  )}>{section.score}%</span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
                </div>
              </div>
              <Progress value={section.score} className="h-1.5 mt-2" />
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="px-4 pb-4 pt-1 space-y-2">
              {section.items.map(item => (
                <CheckItemRow key={item.id} item={item} />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}

function CheckItemRow({ item }: { item: CheckItem }) {
  const config = STATUS_CONFIG[item.status];
  const StatusIcon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 p-2.5 rounded-lg border', config.bg, 'border-border/20')}>
      <StatusIcon className={cn('h-4 w-4 mt-0.5 shrink-0', config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-foreground">{item.label}</span>
          {item.auto ? (
            <Badge variant="outline" className="text-[7px] h-3 bg-primary/10 text-primary border-primary/30">AUTO</Badge>
          ) : (
            <Badge variant="outline" className="text-[7px] h-3 bg-chart-4/10 text-chart-4 border-chart-4/30">MANUAL</Badge>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">{item.description}</p>
        <p className="text-[10px] text-foreground/70 mt-1 italic">{item.detail}</p>
      </div>
      <Badge variant="outline" className={cn('text-[8px] shrink-0', config.color)}>
        {config.label}
      </Badge>
    </div>
  );
}
