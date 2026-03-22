import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
  useDroppable, useDraggable,
} from '@dnd-kit/core';
import {
  Briefcase, TrendingUp, Clock, DollarSign, AlertTriangle, Flame, Target,
  User, Home, Calendar, ArrowUpRight, ArrowDownRight, Eye, MessageSquare,
  ChevronRight, Bell, BarChart3, ShieldAlert, Banknote, Activity,
  GripVertical, X, Plus, Send
} from 'lucide-react';

// ── Types ──

type StageId = 'new_inquiry' | 'buyer_qualified' | 'viewing_scheduled' | 'negotiation' | 'offer_submitted' | 'closing_prep' | 'deal_closed';
type Urgency = 'low' | 'medium' | 'high' | 'critical';

interface Deal {
  id: string;
  propertyTitle: string;
  buyerName: string;
  budgetMin: number;
  budgetMax: number;
  urgency: Urgency;
  lastActivity: string;
  agent: string;
  stage: StageId;
  probability: number;
  value: number;
  daysInPipeline: number;
  notes: { text: string; date: string; author: string }[];
  followUpDate: string | null;
  financingRisk: boolean;
}

const STAGES: { id: StageId; label: string; color: string }[] = [
  { id: 'new_inquiry', label: 'New Inquiry', color: 'text-chart-2' },
  { id: 'buyer_qualified', label: 'Buyer Qualified', color: 'text-primary' },
  { id: 'viewing_scheduled', label: 'Viewing Scheduled', color: 'text-chart-3' },
  { id: 'negotiation', label: 'Negotiation', color: 'text-chart-4' },
  { id: 'offer_submitted', label: 'Offer Submitted', color: 'text-chart-5' },
  { id: 'closing_prep', label: 'Closing Prep', color: 'text-chart-1' },
  { id: 'deal_closed', label: 'Deal Closed', color: 'text-chart-1' },
];

const URGENCY_CONFIG: Record<Urgency, { label: string; class: string }> = {
  low: { label: 'Low', class: 'text-muted-foreground bg-muted/20 border-muted-foreground/20' },
  medium: { label: 'Medium', class: 'text-primary bg-primary/10 border-primary/20' },
  high: { label: 'High', class: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
  critical: { label: 'Critical', class: 'text-destructive bg-destructive/10 border-destructive/20' },
};

// ── Mock Data ──

const MOCK_DEALS: Deal[] = [
  { id: 'd1', propertyTitle: 'Oceanview Villa Seminyak', buyerName: 'James Chen', budgetMin: 850000, budgetMax: 1200000, urgency: 'critical', lastActivity: '2h ago', agent: 'Sarah K.', stage: 'negotiation', probability: 78, value: 980000, daysInPipeline: 12, notes: [{ text: 'Buyer very interested, requesting final pricing', date: '2h ago', author: 'Sarah K.' }], followUpDate: 'Today', financingRisk: false },
  { id: 'd2', propertyTitle: 'Jungle Retreat Ubud', buyerName: 'Maria Santos', budgetMin: 400000, budgetMax: 600000, urgency: 'high', lastActivity: '5h ago', agent: 'Rizky P.', stage: 'viewing_scheduled', probability: 55, value: 520000, daysInPipeline: 8, notes: [{ text: 'Viewing scheduled for tomorrow 10am', date: '5h ago', author: 'Rizky P.' }], followUpDate: 'Tomorrow', financingRisk: false },
  { id: 'd3', propertyTitle: 'Beachfront Canggu Modern', buyerName: 'David Lee', budgetMin: 1200000, budgetMax: 1800000, urgency: 'medium', lastActivity: '1d ago', agent: 'Ayu D.', stage: 'buyer_qualified', probability: 35, value: 1500000, daysInPipeline: 5, notes: [{ text: 'Pre-qualified, high net worth investor', date: '1d ago', author: 'Ayu D.' }], followUpDate: null, financingRisk: false },
  { id: 'd4', propertyTitle: 'Luxury Penthouse Kuta', buyerName: 'Sarah Williams', budgetMin: 600000, budgetMax: 850000, urgency: 'high', lastActivity: '3h ago', agent: 'Budi S.', stage: 'offer_submitted', probability: 82, value: 780000, daysInPipeline: 18, notes: [{ text: 'Offer submitted at $780K, awaiting seller response', date: '3h ago', author: 'Budi S.' }], followUpDate: 'Today', financingRisk: true },
  { id: 'd5', propertyTitle: 'Rice Terrace Villa Tabanan', buyerName: 'Michael Brown', budgetMin: 300000, budgetMax: 450000, urgency: 'low', lastActivity: '3d ago', agent: 'Maya I.', stage: 'new_inquiry', probability: 15, value: 380000, daysInPipeline: 3, notes: [{ text: 'Initial inquiry via website form', date: '3d ago', author: 'System' }], followUpDate: null, financingRisk: false },
  { id: 'd6', propertyTitle: 'Sunset Cliff Villa Uluwatu', buyerName: 'Emma Thompson', budgetMin: 2000000, budgetMax: 2800000, urgency: 'critical', lastActivity: '30m ago', agent: 'Sarah K.', stage: 'closing_prep', probability: 92, value: 2400000, daysInPipeline: 28, notes: [{ text: 'Legal verification in progress, closing next week', date: '30m ago', author: 'Sarah K.' }], followUpDate: 'Today', financingRisk: false },
  { id: 'd7', propertyTitle: 'Modern Loft Denpasar', buyerName: 'Tom Anderson', budgetMin: 200000, budgetMax: 320000, urgency: 'medium', lastActivity: '8h ago', agent: 'Doni W.', stage: 'negotiation', probability: 60, value: 275000, daysInPipeline: 15, notes: [{ text: 'Counter-offer discussion ongoing', date: '8h ago', author: 'Doni W.' }], followUpDate: 'Tomorrow', financingRisk: true },
  { id: 'd8', propertyTitle: 'Garden Villa Sanur', buyerName: 'Lisa Park', budgetMin: 500000, budgetMax: 700000, urgency: 'low', lastActivity: '2d ago', agent: 'Lina P.', stage: 'new_inquiry', probability: 10, value: 580000, daysInPipeline: 2, notes: [{ text: 'Browsing phase, multiple properties of interest', date: '2d ago', author: 'System' }], followUpDate: null, financingRisk: false },
  { id: 'd9', propertyTitle: 'Eco Resort Nusa Dua', buyerName: 'Robert Kim', budgetMin: 3500000, budgetMax: 4500000, urgency: 'high', lastActivity: '6h ago', agent: 'Ayu D.', stage: 'buyer_qualified', probability: 42, value: 4000000, daysInPipeline: 7, notes: [{ text: 'Institutional investor, large budget confirmed', date: '6h ago', author: 'Ayu D.' }], followUpDate: 'Tomorrow', financingRisk: false },
  { id: 'd10', propertyTitle: 'Hillside Villa Jimbaran', buyerName: 'Anna Schmidt', budgetMin: 700000, budgetMax: 950000, urgency: 'medium', lastActivity: '1d ago', agent: 'Rizky P.', stage: 'viewing_scheduled', probability: 48, value: 820000, daysInPipeline: 10, notes: [{ text: 'Second viewing requested after positive first visit', date: '1d ago', author: 'Rizky P.' }], followUpDate: null, financingRisk: false },
  { id: 'd11', propertyTitle: 'Tropical Compound Canggu', buyerName: 'Jack Morrison', budgetMin: 1800000, budgetMax: 2200000, urgency: 'critical', lastActivity: '1h ago', agent: 'Sarah K.', stage: 'deal_closed', probability: 100, value: 2050000, daysInPipeline: 35, notes: [{ text: 'Deal closed! Commission processed.', date: '1h ago', author: 'Sarah K.' }], followUpDate: null, financingRisk: false },
  { id: 'd12', propertyTitle: 'Studio Apartment Seminyak', buyerName: 'Kevin Zhao', budgetMin: 150000, budgetMax: 220000, urgency: 'low', lastActivity: '4d ago', agent: 'Budi S.', stage: 'new_inquiry', probability: 8, value: 185000, daysInPipeline: 4, notes: [], followUpDate: null, financingRisk: true },
];

const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

// ── Draggable Deal Card ──

const DealCard = ({ deal, onClick }: { deal: Deal; onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} className={cn("transition-shadow", isDragging && "opacity-40")}>
      <Card className="border-border/20 hover:border-border/40 transition-all cursor-pointer group" onClick={onClick}>
        <CardContent className="p-2.5">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-foreground truncate">{deal.propertyTitle}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <User className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[8px] text-muted-foreground truncate">{deal.buyerName}</span>
              </div>
            </div>
            <div {...attributes} {...listeners} className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge variant="outline" className={cn("text-[6px] h-3.5 px-1 border", URGENCY_CONFIG[deal.urgency].class)}>
              {deal.urgency === 'critical' && <Flame className="h-2 w-2 mr-0.5" />}
              {URGENCY_CONFIG[deal.urgency].label}
            </Badge>
            <span className="text-[8px] font-semibold tabular-nums text-foreground">{fmt(deal.value)}</span>
            {deal.financingRisk && (
              <Badge variant="outline" className="text-[5px] h-3 px-1 text-destructive border-destructive/20">
                <ShieldAlert className="h-2 w-2" />
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[6px] font-bold text-primary">{deal.agent.charAt(0)}</span>
              </div>
              <span className="text-[7px] text-muted-foreground">{deal.agent}</span>
            </div>
            <div className="flex items-center gap-1">
              {deal.followUpDate && (
                <Bell className={cn("h-2.5 w-2.5", deal.followUpDate === 'Today' ? "text-destructive" : "text-chart-2")} />
              )}
              <span className="text-[7px] text-muted-foreground">{deal.lastActivity}</span>
            </div>
          </div>

          {/* Probability bar */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex-1 h-1 rounded-full bg-muted/15 overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", deal.probability >= 75 ? "bg-chart-1" : deal.probability >= 40 ? "bg-chart-2" : "bg-muted-foreground")}
                style={{ width: `${deal.probability}%` }} />
            </div>
            <span className="text-[7px] tabular-nums font-semibold text-foreground">{deal.probability}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Droppable Column ──

const StageColumn = ({ stage, deals, onCardClick }: {
  stage: typeof STAGES[number]; deals: Deal[]; onCardClick: (d: Deal) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const stageValue = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div ref={setNodeRef} className={cn(
      "flex flex-col min-w-[200px] w-[200px] shrink-0 rounded-xl border transition-colors",
      isOver ? "border-primary/40 bg-primary/[0.03]" : "border-border/20 bg-card/30"
    )}>
      <div className="p-2.5 border-b border-border/10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", stage.id === 'deal_closed' ? "bg-chart-1" : "bg-primary")} />
            <span className="text-[9px] font-semibold text-foreground">{stage.label}</span>
          </div>
          <Badge variant="outline" className="text-[7px] h-4 px-1.5 tabular-nums">{deals.length}</Badge>
        </div>
        <p className="text-[8px] text-muted-foreground tabular-nums">{fmt(stageValue)} pipeline</p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2 min-h-[100px]">
          <AnimatePresence>
            {deals.map((deal, i) => (
              <motion.div key={deal.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                <DealCard deal={deal} onClick={() => onCardClick(deal)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

// ── Main Component ──

const DealPipelineCRM = () => {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const activeDeals = deals.filter(d => d.stage !== 'deal_closed');
  const closingThisWeek = deals.filter(d => d.probability >= 80 && d.stage !== 'deal_closed');
  const avgCycleDays = Math.round(deals.reduce((s, d) => s + d.daysInPipeline, 0) / deals.length);
  const totalPipelineValue = activeDeals.reduce((s, d) => s + d.value, 0);

  const stalledDeals = deals.filter(d => d.daysInPipeline > 20 && d.stage !== 'deal_closed');
  const highProbDeals = deals.filter(d => d.probability >= 70 && d.stage !== 'deal_closed');
  const financingRiskDeals = deals.filter(d => d.financingRisk);
  const priceReductionCandidates = deals.filter(d => d.daysInPipeline > 14 && d.probability < 40);

  const handleDragStart = useCallback((e: DragStartEvent) => setActiveDragId(String(e.active.id)), []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over) return;
    const dealId = String(active.id);
    const newStage = String(over.id) as StageId;
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
  }, []);

  const addNote = () => {
    if (!newNote.trim() || !selectedDeal) return;
    const note = { text: newNote.trim(), date: 'Just now', author: 'You' };
    setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, notes: [note, ...d.notes] } : d));
    setSelectedDeal(prev => prev ? { ...prev, notes: [note, ...prev.notes] } : null);
    setNewNote('');
  };

  const activeDeal = activeDragId ? deals.find(d => d.id === activeDragId) : null;

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Deal Pipeline CRM</h2>
            <p className="text-[10px] text-muted-foreground">Track every deal from inquiry to closing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[8px] h-5 text-chart-1 border-chart-1/20 gap-1">
            <Activity className="h-2.5 w-2.5" />LIVE
          </Badge>
          <Button variant="default" size="sm" className="h-7 text-[10px] gap-1">
            <Plus className="h-3 w-3" />New Deal
          </Button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Deals', value: activeDeals.length.toString(), icon: Briefcase, delta: `${closingThisWeek.length} closing soon`, up: true, accent: 'text-primary' },
          { label: 'Closing This Week', value: closingThisWeek.length.toString(), icon: Target, delta: `${fmt(closingThisWeek.reduce((s, d) => s + d.value, 0))} value`, up: true, accent: 'text-chart-1' },
          { label: 'Avg Cycle Days', value: `${avgCycleDays}d`, icon: Clock, delta: '-2d vs last month', up: true, accent: 'text-chart-2' },
          { label: 'Pipeline Value', value: fmt(totalPipelineValue), icon: DollarSign, delta: '+18% this month', up: true, accent: 'text-chart-3' },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/30 hover:border-border/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10")}>
                  <kpi.icon className={cn("h-4 w-4", kpi.accent)} />
                </div>
                <span className={cn("text-[8px] flex items-center gap-0.5 tabular-nums", kpi.up ? "text-chart-1" : "text-destructive")}>
                  {kpi.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {kpi.delta}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Grid: Kanban + Insights ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        {/* Kanban Board */}
        <Card className="border-border/30 overflow-hidden">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Pipeline Board
              <Badge variant="outline" className="text-[7px] h-4 ml-auto">{deals.length} deals</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {STAGES.map(stage => (
                  <StageColumn key={stage.id} stage={stage}
                    deals={deals.filter(d => d.stage === stage.id)}
                    onCardClick={setSelectedDeal} />
                ))}
              </div>
              <DragOverlay>
                {activeDeal && (
                  <Card className="border-primary/40 shadow-lg w-[200px]">
                    <CardContent className="p-2.5">
                      <p className="text-[10px] font-semibold text-foreground">{activeDeal.propertyTitle}</p>
                      <p className="text-[8px] text-muted-foreground">{activeDeal.buyerName} · {fmt(activeDeal.value)}</p>
                    </CardContent>
                  </Card>
                )}
              </DragOverlay>
            </DndContext>
          </CardContent>
        </Card>

        {/* Insight Panel */}
        <div className="space-y-3">
          {/* Stalled Deals */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                Stalled Deals
                <Badge variant="outline" className="text-[6px] h-3.5 px-1 text-destructive border-destructive/20 ml-auto">{stalledDeals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {stalledDeals.length === 0 ? (
                <p className="text-[8px] text-muted-foreground">No stalled deals</p>
              ) : stalledDeals.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-destructive/5 border border-destructive/10 cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => setSelectedDeal(d)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-medium text-foreground truncate">{d.propertyTitle}</p>
                    <p className="text-[7px] text-destructive">{d.daysInPipeline}d in pipeline</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* High Probability */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-chart-1" />
                High Probability
                <Badge variant="outline" className="text-[6px] h-3.5 px-1 text-chart-1 border-chart-1/20 ml-auto">{highProbDeals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {highProbDeals.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-chart-1/5 border border-chart-1/10 cursor-pointer hover:bg-chart-1/10 transition-colors"
                  onClick={() => setSelectedDeal(d)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-medium text-foreground truncate">{d.propertyTitle}</p>
                    <p className="text-[7px] text-chart-1">{d.probability}% · {fmt(d.value)}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Price Reduction */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-chart-2" />
                Price Reduction Opportunities
                <Badge variant="outline" className="text-[6px] h-3.5 px-1 ml-auto">{priceReductionCandidates.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {priceReductionCandidates.length === 0 ? (
                <p className="text-[8px] text-muted-foreground">No candidates</p>
              ) : priceReductionCandidates.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-chart-2/5 border border-chart-2/10 cursor-pointer hover:bg-chart-2/10 transition-colors"
                  onClick={() => setSelectedDeal(d)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-medium text-foreground truncate">{d.propertyTitle}</p>
                    <p className="text-[7px] text-chart-2">{d.daysInPipeline}d · {d.probability}% prob</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Financing Risk */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3 text-chart-3" />
                Financing Risk Flags
                <Badge variant="outline" className="text-[6px] h-3.5 px-1 text-chart-3 border-chart-3/20 ml-auto">{financingRiskDeals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {financingRiskDeals.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-chart-3/5 border border-chart-3/10 cursor-pointer hover:bg-chart-3/10 transition-colors"
                  onClick={() => setSelectedDeal(d)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-medium text-foreground truncate">{d.propertyTitle}</p>
                    <p className="text-[7px] text-chart-3">{d.buyerName} · {fmt(d.value)}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Deal Detail Modal ── */}
      <Dialog open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
        <DialogContent className="max-w-lg">
          {selectedDeal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  {selectedDeal.propertyTitle}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Deal info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Buyer', value: selectedDeal.buyerName, icon: User },
                    { label: 'Agent', value: selectedDeal.agent, icon: Briefcase },
                    { label: 'Value', value: fmt(selectedDeal.value), icon: DollarSign },
                    { label: 'Budget', value: `${fmt(selectedDeal.budgetMin)} – ${fmt(selectedDeal.budgetMax)}`, icon: Banknote },
                    { label: 'Probability', value: `${selectedDeal.probability}%`, icon: Target },
                    { label: 'Days in Pipeline', value: `${selectedDeal.daysInPipeline}d`, icon: Clock },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/20 bg-muted/5">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[7px] text-muted-foreground">{item.label}</p>
                        <p className="text-[10px] font-semibold text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-[7px] h-4 border", URGENCY_CONFIG[selectedDeal.urgency].class)}>
                    {URGENCY_CONFIG[selectedDeal.urgency].label} Urgency
                  </Badge>
                  <Badge variant="outline" className="text-[7px] h-4">
                    Stage: {STAGES.find(s => s.id === selectedDeal.stage)?.label}
                  </Badge>
                  {selectedDeal.financingRisk && (
                    <Badge variant="outline" className="text-[7px] h-4 text-destructive border-destructive/20">
                      <ShieldAlert className="h-2.5 w-2.5 mr-1" />Financing Risk
                    </Badge>
                  )}
                  {selectedDeal.followUpDate && (
                    <Badge variant="outline" className="text-[7px] h-4 text-chart-2 border-chart-2/20">
                      <Bell className="h-2.5 w-2.5 mr-1" />Follow-up: {selectedDeal.followUpDate}
                    </Badge>
                  )}
                </div>

                <Separator className="opacity-20" />

                {/* Notes timeline */}
                <div>
                  <p className="text-[10px] font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />Notes Timeline
                  </p>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {selectedDeal.notes.length === 0 ? (
                      <p className="text-[9px] text-muted-foreground italic">No notes yet</p>
                    ) : selectedDeal.notes.map((note, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[6px] font-bold text-primary">{note.author.charAt(0)}</span>
                          </div>
                          {i < selectedDeal.notes.length - 1 && <div className="w-px flex-1 bg-border/20 mt-1" />}
                        </div>
                        <div className="pb-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[8px] font-semibold text-foreground">{note.author}</span>
                            <span className="text-[7px] text-muted-foreground">{note.date}</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{note.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add note */}
                  <div className="flex gap-2 mt-3">
                    <Textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note..." className="text-[10px] min-h-[36px] h-9 resize-none" />
                    <Button size="sm" className="h-9 w-9 p-0 shrink-0" onClick={addNote} disabled={!newNote.trim()}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealPipelineCRM;
