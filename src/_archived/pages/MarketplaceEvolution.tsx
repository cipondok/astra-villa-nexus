import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Eye, Handshake, Shield, Brain, TrendingUp,
  Calendar, ArrowRight, CheckCircle2, Clock, AlertTriangle,
  DollarSign, Users, FileCheck, Gavel, BarChart3, Zap,
  ChevronRight, Activity
} from 'lucide-react';

const DEAL_STAGES = [
  { key: 'inquiry', label: 'Inquiry', icon: Users, color: 'hsl(var(--muted-foreground))' },
  { key: 'viewing', label: 'Viewing', icon: Eye, color: 'hsl(210, 80%, 55%)' },
  { key: 'offer', label: 'Offer', icon: DollarSign, color: 'hsl(45, 90%, 50%)' },
  { key: 'negotiation', label: 'Negotiation', icon: Handshake, color: 'hsl(30, 85%, 55%)' },
  { key: 'payment', label: 'Payment', icon: DollarSign, color: 'hsl(260, 70%, 55%)' },
  { key: 'legal', label: 'Legal', icon: FileCheck, color: 'hsl(200, 75%, 50%)' },
  { key: 'closed', label: 'Closed', icon: CheckCircle2, color: 'hsl(145, 65%, 42%)' },
];

const PHASE_DATA = [
  {
    phase: 'A', title: 'Vendor & Supply Engine', icon: Building2,
    tables: ['vendor_business_profiles (extended)', 'vendor_leads_pipeline (new)', 'vendor_performance_analytics'],
    capabilities: ['Performance scoring', 'Response time tracking', 'Deal conversion metrics', 'Lead pipeline management'],
    status: 'deployed'
  },
  {
    phase: 'B', title: 'Property Viewings', icon: Calendar,
    tables: ['property_viewings (new)'],
    capabilities: ['Viewing scheduling', 'Agent calendar integration', 'Confirmation notifications', 'Offer probability tracking'],
    status: 'deployed'
  },
  {
    phase: 'C', title: 'Transaction Engine', icon: Handshake,
    tables: ['escrow_transactions (new)', 'property_offers (extended)'],
    capabilities: ['Escrow management', 'Payment reconciliation', 'Legal verification', '7-stage deal lifecycle'],
    status: 'deployed'
  },
  {
    phase: 'D', title: 'Commission Automation', icon: DollarSign,
    tables: ['transaction_commissions (extended)'],
    capabilities: ['Agent split calculation', 'Platform revenue %', 'Affiliate rewards', 'Settlement tracking'],
    status: 'deployed'
  },
  {
    phase: 'E', title: 'Trust Layer', icon: Shield,
    tables: ['dispute_cases (new)', 'listing_expiry_schedule (new)', 'agent_response_tracking (new)'],
    capabilities: ['Dispute resolution', 'Listing auto-expiry', 'Agent no-response alerts', 'Document signatures'],
    status: 'deployed'
  },
  {
    phase: 'F', title: 'Intelligence Hooks', icon: Brain,
    tables: ['ai_event_signals (triggers)'],
    capabilities: ['viewing_completed signal', 'offer_rejected signal', 'deal_closed signal', 'Auto recalibration'],
    status: 'deployed'
  },
];

const COMMISSION_FLOW = [
  { label: 'Gross Amount', pct: '100%' },
  { label: 'Platform Fee', pct: '2.5%' },
  { label: 'Agent Split', pct: '70%' },
  { label: 'Affiliate Reward', pct: '5%' },
  { label: 'Vendor Service Fee', pct: 'Variable' },
];

const AI_SIGNALS = [
  { event: 'viewing_completed', trigger: 'Viewing status → completed', effect: 'Recalculate offer probability' },
  { event: 'offer_rejected', trigger: 'Offer status → rejected', effect: 'Update price prediction model' },
  { event: 'deal_closed', trigger: 'Deal stage → closed', effect: 'Train conversion model + calculate days-to-close' },
  { event: 'price_drop_signal', trigger: 'Price reduced >5%', effect: 'Re-score opportunity + alert investors' },
];

const MarketplaceEvolution = () => {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Marketplace Evolution Engine</h1>
                <p className="text-sm text-muted-foreground">Safe incremental upgrade architecture for deal execution & supply scaling</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Deal Lifecycle State Machine */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Deal Lifecycle State Machine
          </h2>
          <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-[700px]">
              {DEAL_STAGES.map((stage, i) => (
                <React.Fragment key={stage.key}>
                  <div className="flex flex-col items-center gap-2 min-w-[90px]">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                      style={{ borderColor: stage.color, backgroundColor: `${stage.color}15` }}
                    >
                      <stage.icon className="w-5 h-5" style={{ color: stage.color }} />
                    </div>
                    <span className="text-xs font-medium text-center">{stage.label}</span>
                  </div>
                  {i < DEAL_STAGES.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Phase Cards Grid */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evolution Phases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHASE_DATA.map((phase, i) => (
              <motion.div
                key={phase.phase}
                className={`bg-card border rounded-xl p-5 cursor-pointer transition-all ${activePhase === i ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'}`}
                onClick={() => setActivePhase(i)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <phase.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">Phase {phase.phase}</span>
                      <h3 className="text-sm font-semibold leading-tight">{phase.title}</h3>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium uppercase">
                    {phase.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tables</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {phase.tables.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Capabilities</span>
                    <ul className="mt-1 space-y-0.5">
                      {phase.capabilities.map(c => (
                        <li key={c} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Commission Flow */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Commission Split Architecture
          </h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {COMMISSION_FLOW.map((item, i) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center gap-1 min-w-[100px]">
                    <div className="text-lg font-bold text-primary">{item.pct}</div>
                    <div className="text-xs text-muted-foreground text-center">{item.label}</div>
                  </div>
                  {i < COMMISSION_FLOW.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Settlement Status: <span className="font-mono">pending → approved → paid</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* AI Signal Integration Map */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Intelligence Signal Map
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1.5fr_1.5fr] text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 px-4 py-2.5 border-b border-border">
              <span>Event</span>
              <span>Trigger</span>
              <span>Intelligence Effect</span>
            </div>
            {AI_SIGNALS.map((signal, i) => (
              <div key={signal.event} className={`grid grid-cols-[1fr_1.5fr_1.5fr] px-4 py-3 text-sm items-center ${i < AI_SIGNALS.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="font-mono text-xs text-primary">{signal.event}</span>
                <span className="text-muted-foreground text-xs">{signal.trigger}</span>
                <span className="text-xs flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  {signal.effect}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* New/Extended Database Entities Summary */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Safe Incremental Rollout Summary
          </h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-primary">6</div>
                <div className="text-xs text-muted-foreground">New Tables Created</div>
                <div className="mt-2 space-y-1">
                  {['property_viewings', 'escrow_transactions', 'vendor_leads_pipeline', 'dispute_cases', 'listing_expiry_schedule', 'agent_response_tracking'].map(t => (
                    <div key={t} className="text-[10px] font-mono text-muted-foreground">• {t}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-xs text-muted-foreground">Tables Extended</div>
                <div className="mt-2 space-y-1">
                  {['vendor_business_profiles', 'property_offers', 'transaction_commissions'].map(t => (
                    <div key={t} className="text-[10px] font-mono text-muted-foreground">• {t}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">2</div>
                <div className="text-xs text-muted-foreground">Database Triggers</div>
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground">• trg_viewing_signals</div>
                  <div className="text-[10px] font-mono text-muted-foreground">• trg_offer_signals</div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% backward compatible
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MarketplaceEvolution;
