import React, { useState, lazy, Suspense } from 'react';
import { DndContext, closestCorners, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, Briefcase, TrendingUp, Target, Zap, ArrowRight, Bot, MessageSquare, DollarSign, Eye, Handshake, CheckCircle2, ChevronRight, Plus, LayoutDashboard, PieChart, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──
interface DealCard {
  id: string;
  investor: string;
  property: string;
  value: string;
  score: number;
  daysInStage: number;
  lastActivity: string;
  avatar?: string;
}

type Stage = 'lead' | 'interested' | 'negotiation' | 'closed';

const STAGE_META: Record<Stage, { label: string; icon: React.ElementType; accent: string }> = {
  lead: { label: 'Lead', icon: Eye, accent: 'border-blue-500/40' },
  interested: { label: 'Interested', icon: Handshake, accent: 'border-amber-500/40' },
  negotiation: { label: 'Negotiation', icon: MessageSquare, accent: 'border-purple-500/40' },
  closed: { label: 'Closed', icon: CheckCircle2, accent: 'border-emerald-500/40' },
};

// ── Mock data ──
const INITIAL_DEALS: Record<Stage, DealCard[]> = {
  lead: [
    { id: '1', investor: 'Marcus Chen', property: 'Seminyak Villa #12', value: '$420K', score: 72, daysInStage: 3, lastActivity: 'Viewed listing' },
    { id: '2', investor: 'Sarah Al-Rashid', property: 'Canggu Penthouse', value: '$680K', score: 58, daysInStage: 7, lastActivity: 'Downloaded brochure' },
    { id: '3', investor: 'James Porter', property: 'Ubud Retreat', value: '$310K', score: 45, daysInStage: 1, lastActivity: 'Inquiry submitted' },
  ],
  interested: [
    { id: '4', investor: 'Li Wei Zhang', property: 'Uluwatu Cliff Villa', value: '$1.2M', score: 85, daysInStage: 5, lastActivity: 'Scheduled viewing' },
    { id: '5', investor: 'Anna Petrov', property: 'Nusa Dua Estate', value: '$890K', score: 78, daysInStage: 2, lastActivity: 'Requested ROI analysis' },
  ],
  negotiation: [
    { id: '6', investor: 'David Kim', property: 'Seminyak Villa #8', value: '$520K', score: 92, daysInStage: 4, lastActivity: 'Counter-offer sent' },
  ],
  closed: [
    { id: '7', investor: 'Elena Vasquez', property: 'Canggu Beach House', value: '$750K', score: 100, daysInStage: 0, lastActivity: 'Payment confirmed' },
  ],
};

const AI_SUGGESTIONS = [
  { type: 'urgent', text: 'Li Wei Zhang has been in "Interested" for 5 days. Send ROI comparison to accelerate.' },
  { type: 'opportunity', text: 'David Kim's counter-offer gap is only 4%. Suggest splitting the difference.' },
  { type: 'insight', text: 'Sarah Al-Rashid matches high-intent investor profile. Prioritize personal outreach.' },
  { type: 'alert', text: 'James Porter inquiry is 1 day old. 24hr follow-up window closing.' },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Pipeline', active: true },
  { icon: Users, label: 'Investors' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: PieChart, label: 'Reports' },
  { icon: FileText, label: 'Documents' },
  { icon: Settings, label: 'Settings' },
];

// ── Deal Card Component ──
const DealCardItem = React.forwardRef<HTMLDivElement, { deal: DealCard; isDragging?: boolean; onClick?: () => void }>(
  ({ deal, isDragging, onClick }, ref) => {
    const scoreColor = deal.score >= 80 ? 'text-emerald-400' : deal.score >= 60 ? 'text-amber-400' : 'text-red-400';
    return (
      <motion.div
        ref={ref}
        layout
        onClick={onClick}
        className={cn(
          'p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200',
          'bg-[#0F1726]/80 border border-[hsl(var(--border))]/20 hover:border-[hsl(var(--primary))]/40',
          'backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-[hsl(var(--primary))]/5',
          isDragging && 'opacity-50 scale-95'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/60 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {deal.investor.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">{deal.investor}</span>
          </div>
          <span className={cn('text-[10px] font-mono font-bold', scoreColor)}>{deal.score}</span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{deal.property}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-semibold text-[hsl(var(--primary))]">{deal.value}</span>
          <span className="text-[10px] text-muted-foreground">{deal.daysInStage}d</span>
        </div>
      </motion.div>
    );
  }
);
DealCardItem.displayName = 'DealCardItem';

// ── Sortable wrapper ──
function SortableDealCard({ deal, onClick }: { deal: DealCard; onClick: () => void }) {
  const { useSortable } = require('@dnd-kit/sortable');
  const { CSS } = require('@dnd-kit/utilities');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCardItem deal={deal} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}

// ── Pipeline Column ──
function PipelineColumn({ stage, deals, onCardClick }: { stage: Stage; deals: DealCard[]; onCardClick: (d: DealCard) => void }) {
  const meta = STAGE_META[stage];
  const Icon = meta.icon;
  return (
    <div className={cn('flex flex-col min-w-[240px] flex-1 rounded-2xl border-t-2 bg-[#0B1220]/60 backdrop-blur-sm', meta.accent)}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">{meta.label}</h3>
        </div>
        <span className="text-[10px] font-mono bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-2 py-0.5 rounded-full">
          {deals.length}
        </span>
      </div>
      <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-3 flex-1 min-h-[200px]">
          <AnimatePresence>
            {deals.map(deal => (
              <SortableDealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal)} />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </div>
  );
}

// ── KPI Card ──
function KpiCard({ icon: Icon, label, value, trend }: { icon: React.ElementType; label: string; value: string; trend?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0F1726]/60 border border-[hsl(var(--border))]/10">
      <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
        <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
      {trend && <span className="text-[10px] text-emerald-400 ml-auto font-mono">↑{trend}</span>}
    </div>
  );
}

// ── Main Page ──
export default function DealExecutionCommandCenter() {
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [activeDeal, setActiveDeal] = useState<DealCard | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealCard | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findStage = (id: string): Stage | null => {
    for (const [stage, cards] of Object.entries(deals)) {
      if (cards.find(c => c.id === id)) return stage as Stage;
    }
    return null;
  };

  const handleDragStart = (e: DragStartEvent) => {
    const stage = findStage(e.active.id as string);
    if (stage) setActiveDeal(deals[stage].find(d => d.id === e.active.id) || null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = e;
    if (!over) return;

    const fromStage = findStage(active.id as string);
    const toStage = findStage(over.id as string);

    if (!fromStage || !toStage || fromStage === toStage) return;

    setDeals(prev => {
      const card = prev[fromStage].find(c => c.id === active.id);
      if (!card) return prev;
      return {
        ...prev,
        [fromStage]: prev[fromStage].filter(c => c.id !== active.id),
        [toStage]: [...prev[toStage], { ...card, daysInStage: 0 }],
      };
    });
  };

  const totalDeals = Object.values(deals).flat().length;
  const avgScore = Math.round(Object.values(deals).flat().reduce((s, d) => s + d.score, 0) / totalDeals);
  const pipelineValue = Object.values(deals).flat()
    .reduce((sum, d) => sum + parseFloat(d.value.replace(/[$KM,]/g, '')) * (d.value.includes('M') ? 1000 : 1), 0);

  return (
    <div className="flex h-screen bg-[#070B14] text-foreground overflow-hidden">
      {/* ── Left Sidebar ── */}
      <aside className="w-16 flex flex-col items-center py-6 gap-6 border-r border-[hsl(var(--border))]/10 bg-[#0B1220]/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/50 flex items-center justify-center mb-4">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {NAV_ITEMS.map((item, i) => (
          <button
            key={i}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
              item.active
                ? 'bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--border))]/10'
            )}
            title={item.label}
          >
            <item.icon className="h-[18px] w-[18px]" />
          </button>
        ))}
      </aside>

      {/* ── Center Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-[hsl(var(--border))]/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Deal Command Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time pipeline intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 rounded-xl bg-[hsl(var(--primary))] text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> New Deal
            </button>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 px-6 py-4">
          <KpiCard icon={Briefcase} label="Active Deals" value={String(totalDeals)} trend="12%" />
          <KpiCard icon={Target} label="Avg Deal Score" value={String(avgScore)} />
          <KpiCard icon={DollarSign} label="Pipeline Value" value={`$${(pipelineValue).toFixed(0)}K`} trend="8%" />
          <KpiCard icon={TrendingUp} label="Conversion" value="34%" trend="5%" />
        </div>

        {/* Pipeline Columns */}
        <div className="flex-1 overflow-x-auto px-6 pb-6">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full min-w-max">
              {(Object.keys(STAGE_META) as Stage[]).map(stage => (
                <PipelineColumn key={stage} stage={stage} deals={deals[stage]} onCardClick={setSelectedDeal} />
              ))}
            </div>
            <DragOverlay>
              {activeDeal && <DealCardItem deal={activeDeal} />}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <aside className="w-80 border-l border-[hsl(var(--border))]/10 bg-[#0B1220]/60 flex flex-col overflow-hidden">
        {/* Investor Profile */}
        <div className="p-5 border-b border-[hsl(var(--border))]/10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {selectedDeal ? 'Investor Profile' : 'Select a Deal'}
          </h2>
          {selectedDeal ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/40 flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {selectedDeal.investor.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedDeal.investor}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedDeal.property}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#0F1726]/80">
                  <p className="text-[10px] text-muted-foreground">Deal Value</p>
                  <p className="text-sm font-bold text-[hsl(var(--primary))]">{selectedDeal.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#0F1726]/80">
                  <p className="text-[10px] text-muted-foreground">Score</p>
                  <p className="text-sm font-bold">{selectedDeal.score}/100</p>
                </div>
                <div className="p-2 rounded-lg bg-[#0F1726]/80 col-span-2">
                  <p className="text-[10px] text-muted-foreground">Last Activity</p>
                  <p className="text-xs">{selectedDeal.lastActivity}</p>
                </div>
              </div>
              <button className="w-full h-9 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-semibold hover:bg-[hsl(var(--primary))]/20 transition-colors flex items-center justify-center gap-1.5">
                Contact Investor <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">Click on a deal card to view investor details and AI suggestions.</p>
          )}
        </div>

        {/* AI Suggestions */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Suggestions</h2>
          </div>
          <div className="space-y-2">
            {AI_SUGGESTIONS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'p-3 rounded-xl border text-xs leading-relaxed',
                  s.type === 'urgent' && 'bg-red-500/5 border-red-500/20 text-red-300',
                  s.type === 'opportunity' && 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300',
                  s.type === 'insight' && 'bg-amber-500/5 border-amber-500/20 text-amber-300',
                  s.type === 'alert' && 'bg-blue-500/5 border-blue-500/20 text-blue-300',
                )}
              >
                {s.text}
              </motion.div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
