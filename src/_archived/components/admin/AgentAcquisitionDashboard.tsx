import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useAgentAcquisitionPipeline,
  useUpdateAgentStage,
  useAddAgentToAcquisition,
  type AcquisitionStage,
  type SourceChannel,
  type AgentPipelineEntry,
} from "@/hooks/useAgentAcquisitionPipeline";
import { toast } from "sonner";
import {
  Loader2, Users, UserPlus, Phone, MessageSquare, Instagram, Globe, Share2, Calendar, MapPin,
  ChevronRight, CheckCircle2, Circle, Clock, AlertTriangle, Trophy, Star, Zap, Target,
  BarChart3, TrendingUp, Building, Crown, Shield, ArrowRight, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Stage Config ──

const stageConfig: Record<AcquisitionStage, { label: string; color: string; bg: string; border: string; icon: React.ElementType; order: number }> = {
  identified:  { label: "Identified",  color: "text-muted-foreground", bg: "bg-muted/20",       border: "border-border/30",       icon: Circle,        order: 0 },
  contacted:   { label: "Contacted",   color: "text-chart-4",         bg: "bg-chart-4/10",     border: "border-chart-4/30",     icon: Phone,         order: 1 },
  interested:  { label: "Interested",  color: "text-primary",         bg: "bg-primary/10",     border: "border-primary/30",     icon: Star,          order: 2 },
  onboarding:  { label: "Onboarding",  color: "text-chart-3",         bg: "bg-chart-3/10",     border: "border-chart-3/30",     icon: Clock,         order: 3 },
  activated:   { label: "Activated",   color: "text-chart-1",         bg: "bg-chart-1/10",     border: "border-chart-1/30",     icon: CheckCircle2,  order: 4 },
  churned:     { label: "Churned",     color: "text-destructive",     bg: "bg-destructive/10", border: "border-destructive/30", icon: AlertTriangle, order: 5 },
};

const channelConfig: Record<SourceChannel, { label: string; icon: React.ElementType; color: string }> = {
  whatsapp:        { label: "WhatsApp",    icon: MessageSquare, color: "text-chart-1" },
  instagram:       { label: "Instagram",   icon: Instagram,     color: "text-chart-3" },
  community_group: { label: "Community",   icon: Users,         color: "text-primary" },
  referral:        { label: "Referral",    icon: Share2,        color: "text-chart-4" },
  direct:          { label: "Direct",      icon: Phone,         color: "text-foreground" },
  event:           { label: "Event",       icon: Calendar,      color: "text-chart-5" },
  linkedin:        { label: "LinkedIn",    icon: Globe,         color: "text-primary" },
};

const nextStage: Record<AcquisitionStage, AcquisitionStage | null> = {
  identified: "contacted",
  contacted: "interested",
  interested: "onboarding",
  onboarding: "activated",
  activated: null,
  churned: null,
};

// ── Funnel Visualization ──

function AcquisitionFunnel({ stats }: { stats: any }) {
  const stages: AcquisitionStage[] = ["identified", "contacted", "interested", "onboarding", "activated"];
  const maxCount = Math.max(...stages.map((s) => stats[s] || 0), 1);

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Acquisition Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {stages.map((stage, i) => {
          const sc = stageConfig[stage];
          const count = stats[stage] || 0;
          const pct = Math.round((count / maxCount) * 100);
          const convFromPrev = i > 0 && stats[stages[i - 1]] > 0 ? Math.round((count / stats[stages[i - 1]]) * 100) : null;
          return (
            <div key={stage}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", sc.color, sc.bg, sc.border)}>
                    {sc.label}
                  </Badge>
                  {convFromPrev !== null && (
                    <span className="text-[8px] text-muted-foreground">({convFromPrev}% conv.)</span>
                  )}
                </div>
                <span className={cn("text-[11px] font-bold", sc.color)}>{count}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", sc.bg.replace("/10", "/40"))} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        <Separator className="bg-border/20 my-2" />
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">Overall Conversion</span>
          <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-bold", stats.conversionRate >= 30 ? "text-chart-1" : stats.conversionRate >= 15 ? "text-chart-4" : "text-muted-foreground")}>
            {stats.conversionRate}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Channel Breakdown ──

function ChannelBreakdown({ byChannel }: { byChannel: Record<string, number> }) {
  const sorted = Object.entries(byChannel).sort(([, a], [, b]) => b - a);
  const total = sorted.reduce((s, [, c]) => s + c, 0);

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-chart-3" /> Acquisition Channels
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {sorted.map(([channel, count]) => {
          const ch = channelConfig[channel as SourceChannel] || { label: channel, icon: Globe, color: "text-muted-foreground" };
          const ChIcon = ch.icon;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={channel} className="flex items-center gap-2">
              <ChIcon className={cn("h-3.5 w-3.5 shrink-0", ch.color)} />
              <span className="text-[10px] font-medium text-foreground flex-1">{ch.label}</span>
              <span className="text-[9px] text-muted-foreground">{pct}%</span>
              <span className="text-[10px] font-bold text-foreground w-5 text-right">{count}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── City Distribution ──

function CityDistribution({ byCity }: { byCity: Record<string, number> }) {
  const sorted = Object.entries(byCity).sort(([, a], [, b]) => b - a).slice(0, 8);

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-chart-4" /> City Coverage
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-1.5">
        {sorted.map(([city, count]) => (
          <div key={city} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/10">
            <span className="text-[10px] font-medium text-foreground">{city}</span>
            <Badge variant="outline" className="text-[8px] h-4 px-1.5 text-muted-foreground">{count} agents</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Agent Card ──

function AgentCard({ agent, onAdvance }: { agent: AgentPipelineEntry; onAdvance: (id: string, stage: AcquisitionStage) => void }) {
  const sc = stageConfig[agent.stage];
  const StageIcon = sc.icon;
  const ch = channelConfig[agent.source_channel] || channelConfig.direct;
  const ChIcon = ch.icon;
  const next = nextStage[agent.stage];

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-card/60 hover:bg-accent/5 transition-all">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", sc.bg)}>
        <StageIcon className={cn("h-4 w-4", sc.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-bold text-foreground truncate">{agent.agent_name}</span>
          <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", sc.color, sc.bg, sc.border)}>{sc.label}</Badge>
          {agent.priority === "high" && <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-chart-3 bg-chart-3/10 border-chart-3/30">High Priority</Badge>}
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-1">
          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{agent.city}</span>
          <span className="flex items-center gap-0.5"><ChIcon className="h-2.5 w-2.5" />{ch.label}</span>
          <span className="flex items-center gap-0.5"><Building className="h-2.5 w-2.5" />{agent.listing_portfolio_size} listings</span>
        </div>
        {agent.specialization && (
          <span className="text-[9px] text-muted-foreground italic">{agent.specialization}</span>
        )}
        {agent.notes && (
          <p className="text-[9px] text-muted-foreground/70 mt-0.5 line-clamp-1">{agent.notes}</p>
        )}
      </div>
      {next && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[9px] gap-1 shrink-0"
          onClick={() => onAdvance(agent.id, next)}
        >
          <ArrowRight className="h-3 w-3" />
          {stageConfig[next].label}
        </Button>
      )}
    </div>
  );
}

// ── Add Agent Dialog ──

function AddAgentDialog({ onAdd }: { onAdd: (data: any) => void }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [channel, setChannel] = useState<SourceChannel>("whatsapp");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [portfolio, setPortfolio] = useState("0");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!name || !city) { toast.error("Nama dan kota wajib diisi"); return; }
    onAdd({
      agent_name: name, city, source_channel: channel, phone: phone || null,
      specialization: specialization || null, listing_portfolio_size: parseInt(portfolio) || 0,
      notes: notes || null, stage: "identified", priority: parseInt(portfolio) >= 20 ? "high" : "medium",
    });
    setOpen(false);
    setName(""); setCity(""); setPhone(""); setSpecialization(""); setPortfolio("0"); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-8 text-[10px] gap-1.5"><Plus className="h-3 w-3" /> Add Agent</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Add Agent to Pipeline</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-[10px]">Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-[11px]" /></div>
          <div className="space-y-1"><Label className="text-[10px]">City *</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-8 text-[11px]" /></div>
          <div className="space-y-1"><Label className="text-[10px]">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-[11px]" /></div>
          <div className="space-y-1">
            <Label className="text-[10px]">Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as SourceChannel)}>
              <SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(channelConfig).map(([k, v]) => <SelectItem key={k} value={k} className="text-[11px]">{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-[10px]">Specialization</Label><Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="h-8 text-[11px]" /></div>
          <div className="space-y-1"><Label className="text-[10px]">Portfolio Size</Label><Input type="number" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="h-8 text-[11px]" /></div>
          <div className="col-span-2 space-y-1"><Label className="text-[10px]">Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="text-[11px] min-h-[60px]" /></div>
        </div>
        <Button onClick={handleSubmit} className="w-full h-8 text-[10px]">Add to Pipeline</Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Strategy Cards ──

function StrategySection() {
  const strategies = [
    {
      title: "🎯 Target Agent Profile",
      icon: Target,
      color: "text-primary",
      items: [
        "Active local agents with 15+ current listings",
        "Strong presence in target city neighborhoods",
        "Existing digital literacy (WhatsApp Business, social media)",
        "ERA, Ray White, Century 21 affiliates — independent agents preferred",
        "Specialization in residential, luxury, or investment properties",
      ],
    },
    {
      title: "📱 First-Contact Channels",
      icon: MessageSquare,
      color: "text-chart-1",
      items: [
        "WhatsApp outreach: Personalized message with platform value prop",
        "Instagram DM: Engage agents posting property content actively",
        "Property community groups: OLX/Rumah123 agent forums",
        "REI expos & local property events: Face-to-face recruitment",
        "Agent referral program: Existing agents invite their network",
      ],
    },
    {
      title: "🚀 Activation Onboarding Flow",
      icon: Zap,
      color: "text-chart-3",
      items: [
        "Step 1: One-click signup via WhatsApp link (no forms)",
        "Step 2: Upload first 3 listings with AI-assisted descriptions",
        "Step 3: AI auto-generates SEO title + description for each listing",
        "Step 4: First buyer lead delivered within 48 hours (priority queue)",
        "Step 5: Respond to lead → unlock full dashboard features",
      ],
    },
    {
      title: "🏆 Performance Incentives",
      icon: Trophy,
      color: "text-chart-4",
      items: [
        "AI Deal Score: Show agents which listings will close fastest",
        "Smart pricing alerts: AI flags optimal price adjustment windows",
        "Lead priority queue: Top performers get first access to hot leads",
        "Monthly leaderboard prizes: Top 3 agents earn premium subscriptions",
        "Faster closing proof: Dashboard shows avg deal time reduction with AI",
      ],
    },
    {
      title: "🛡️ Retention Mechanisms",
      icon: Shield,
      color: "text-primary",
      items: [
        "Leaderboard visibility → agents compete for city #1 ranking",
        "Priority lead distribution for agents with >80% response rate",
        "Premium tools unlock: ROI forecasts, market intelligence, investor matching",
        "Agent reputation badges: Verified, Top Performer, Trusted Agent",
        "Monthly performance reports with AI growth recommendations",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {strategies.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.title} className="rounded-2xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-1.5">
                <Icon className={cn("h-4 w-4", s.color)} />
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ul className="space-y-1.5">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-[9px] text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ──

const AgentAcquisitionDashboard = React.memo(function AgentAcquisitionDashboard() {
  const { data, isLoading, error } = useAgentAcquisitionPipeline();
  const updateStage = useUpdateAgentStage();
  const addAgent = useAddAgentToAcquisition();
  const [stageFilter, setStageFilter] = useState<AcquisitionStage | "all">("all");

  const handleAdvance = useCallback((id: string, stage: AcquisitionStage) => {
    updateStage.mutate({ id, stage }, {
      onSuccess: () => toast.success(`Agent moved to ${stageConfig[stage].label}`),
      onError: (e) => toast.error(e.message),
    });
  }, [updateStage]);

  const handleAdd = useCallback((entry: any) => {
    addAgent.mutate(entry, {
      onSuccess: () => toast.success("Agent added to pipeline"),
      onError: (e) => toast.error(e.message),
    });
  }, [addAgent]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (stageFilter === "all") return data.entries;
    return data.entries.filter((e) => e.stage === stageFilter);
  }, [data, stageFilter]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error) return <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-6"><p className="text-sm text-destructive">{(error as Error).message}</p></Card>;

  const stats = data!.stats;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-4/20" />
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Agent Acquisition & Activation Strategy
              </CardTitle>
              <CardDescription className="text-[11px]">
                Pipeline management for national agent network growth — identify → contact → onboard → activate
              </CardDescription>
            </div>
            <AddAgentDialog onAdd={handleAdd} />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: "Total Pipeline", value: String(stats.total), icon: Users, color: "text-foreground" },
              { label: "Activated", value: String(stats.activated), icon: CheckCircle2, color: "text-chart-1" },
              { label: "In Onboarding", value: String(stats.onboarding), icon: Clock, color: "text-chart-3" },
              { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-primary" },
              { label: "Cities Covered", value: String(Object.keys(stats.byCity).length), icon: MapPin, color: "text-chart-4" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="rounded-xl border-border/30 bg-card/60">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
                  <div>
                    <span className="text-[8px] text-muted-foreground block">{label}</span>
                    <span className={cn("text-[12px] font-bold", color)}>{value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="pipeline" className="text-[10px] h-6 px-3">Pipeline</TabsTrigger>
          <TabsTrigger value="analytics" className="text-[10px] h-6 px-3">Analytics</TabsTrigger>
          <TabsTrigger value="strategy" className="text-[10px] h-6 px-3">Strategy Framework</TabsTrigger>
        </TabsList>

        {/* Pipeline */}
        <TabsContent value="pipeline" className="mt-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-[9px] h-5 px-2 cursor-pointer transition-all", stageFilter === "all" ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground")}
              onClick={() => setStageFilter("all")}
            >
              All ({stats.total})
            </Badge>
            {(Object.keys(stageConfig) as AcquisitionStage[]).map((stage) => {
              const sc = stageConfig[stage];
              const count = stats[stage] || 0;
              return (
                <Badge
                  key={stage}
                  variant="outline"
                  className={cn("text-[9px] h-5 px-2 cursor-pointer transition-all", stageFilter === stage ? cn(sc.bg, sc.color, sc.border) : "text-muted-foreground")}
                  onClick={() => setStageFilter(stage)}
                >
                  {sc.label} ({count})
                </Badge>
              );
            })}
          </div>

          <div className="space-y-2">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onAdvance={handleAdvance} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-[11px]">No agents in this stage</div>
            )}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <AcquisitionFunnel stats={stats} />
            <ChannelBreakdown byChannel={stats.byChannel} />
            <CityDistribution byCity={stats.byCity} />
          </div>
        </TabsContent>

        {/* Strategy */}
        <TabsContent value="strategy" className="mt-3">
          <StrategySection />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default AgentAcquisitionDashboard;
