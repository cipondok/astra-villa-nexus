import { useState } from 'react';

export type AutomationStatus = 'deployed' | 'in_progress' | 'planned' | 'not_started';
export type AutomationPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface AutomationItem {
  id: string;
  domain: string;
  title: string;
  description: string;
  priority: AutomationPriority;
  status: AutomationStatus;
  phase: number;
  trigger: string;
  action: string;
  kpiImpact: string;
}

export interface EfficiencyKPI {
  label: string;
  before: string;
  after: string;
  improvement: string;
  domain: string;
}

const AUTOMATION_ITEMS: AutomationItem[] = [
  // Deal Pipeline
  { id: 'd1', domain: 'Deal Pipeline', title: 'Stage transition reminders', description: 'Auto-notify agents when deals idle >24h in any stage', priority: 'P0', status: 'deployed', phase: 1, trigger: 'Deal idle >24 hours', action: 'Push + email to assigned agent', kpiImpact: 'Reduce avg stage duration 30%' },
  { id: 'd2', domain: 'Deal Pipeline', title: 'Negotiation follow-up triggers', description: 'Schedule automated follow-ups after counter-offers', priority: 'P0', status: 'deployed', phase: 1, trigger: 'Counter-offer submitted', action: 'Schedule 48h follow-up task', kpiImpact: 'Increase close rate 15%' },
  { id: 'd3', domain: 'Deal Pipeline', title: 'Risk detection alerts', description: 'Flag deals with high cancellation probability', priority: 'P0', status: 'in_progress', phase: 1, trigger: 'Risk score >70%', action: 'Alert team lead + suggest intervention', kpiImpact: 'Reduce deal loss 20%' },
  { id: 'd4', domain: 'Deal Pipeline', title: 'Auto deal stage advancement', description: 'Move deals forward when milestone conditions met', priority: 'P1', status: 'planned', phase: 2, trigger: 'All stage requirements fulfilled', action: 'Advance to next stage + notify parties', kpiImpact: 'Reduce time-to-close 25%' },
  { id: 'd5', domain: 'Deal Pipeline', title: 'Commission auto-calculation', description: 'Calculate and display commission at each stage', priority: 'P1', status: 'in_progress', phase: 2, trigger: 'Deal enters closing stage', action: 'Generate commission breakdown', kpiImpact: 'Eliminate manual errors 100%' },

  // Vendor Routing
  { id: 'v1', domain: 'Vendor Routing', title: 'Intelligent job assignment', description: 'Auto-match vendor jobs by rating, proximity, and capacity', priority: 'P1', status: 'deployed', phase: 1, trigger: 'New service request created', action: 'Score vendors + assign top match', kpiImpact: 'Reduce assignment time 80%' },
  { id: 'v2', domain: 'Vendor Routing', title: 'SLA monitoring triggers', description: 'Alert when vendor response exceeds SLA threshold', priority: 'P1', status: 'in_progress', phase: 2, trigger: 'Response time >SLA limit', action: 'Escalate to backup vendor + notify ops', kpiImpact: 'Improve SLA compliance 40%' },
  { id: 'v3', domain: 'Vendor Routing', title: 'Escalation routing logic', description: 'Auto-escalate unresolved jobs through management tiers', priority: 'P2', status: 'planned', phase: 2, trigger: 'Job unresolved after 2 escalation attempts', action: 'Route to ops manager + flag for review', kpiImpact: 'Reduce resolution time 35%' },
  { id: 'v4', domain: 'Vendor Routing', title: 'Vendor performance scoring updates', description: 'Recalculate vendor scores after each completed job', priority: 'P2', status: 'planned', phase: 3, trigger: 'Job marked complete + rated', action: 'Update composite score + ranking', kpiImpact: 'Improve match quality 25%' },

  // Investor Intelligence
  { id: 'i1', domain: 'Investor Intelligence', title: 'High-liquidity deal notifications', description: 'Push alerts for properties matching investor criteria with high liquidity', priority: 'P0', status: 'deployed', phase: 1, trigger: 'New listing matches saved criteria + liquidity >70', action: 'Push notification + email digest', kpiImpact: 'Increase inquiry rate 45%' },
  { id: 'i2', domain: 'Investor Intelligence', title: 'Urgency signal push alerts', description: 'Notify investors of time-sensitive opportunities', priority: 'P0', status: 'in_progress', phase: 1, trigger: 'Urgency score >80 or price drop >5%', action: 'Immediate push + WhatsApp alert', kpiImpact: 'Increase conversion speed 35%' },
  { id: 'i3', domain: 'Investor Intelligence', title: 'Portfolio insight updates', description: 'Weekly automated portfolio performance summaries', priority: 'P1', status: 'planned', phase: 2, trigger: 'Weekly schedule (Monday 8AM)', action: 'Generate + send portfolio report', kpiImpact: 'Improve retention 20%' },
  { id: 'i4', domain: 'Investor Intelligence', title: 'AI deal recommendation engine', description: 'Proactive deal suggestions based on behavioral patterns', priority: 'P2', status: 'not_started', phase: 3, trigger: 'Weekly behavioral analysis cycle', action: 'Curate top-5 deals per investor profile', kpiImpact: 'Increase deals watched 50%' },

  // Growth & Performance
  { id: 'g1', domain: 'Growth Monitoring', title: 'KPI anomaly detection alerts', description: 'Detect unusual spikes or drops in marketplace metrics', priority: 'P1', status: 'in_progress', phase: 2, trigger: 'Metric deviates >2 std from 7-day avg', action: 'Alert founder + ops dashboard flag', kpiImpact: 'Reduce response time to issues 60%' },
  { id: 'g2', domain: 'Growth Monitoring', title: 'Campaign ROI tracking', description: 'Auto-calculate and report campaign performance daily', priority: 'P1', status: 'planned', phase: 2, trigger: 'Daily schedule (6AM)', action: 'Generate ROI report + flag underperformers', kpiImpact: 'Improve marketing spend efficiency 30%' },
  { id: 'g3', domain: 'Growth Monitoring', title: 'Revenue milestone notifications', description: 'Celebrate and alert on revenue milestone achievements', priority: 'P2', status: 'planned', phase: 3, trigger: 'Cumulative revenue crosses milestone', action: 'Founder alert + team notification', kpiImpact: 'Boost team motivation' },
  { id: 'g4', domain: 'Growth Monitoring', title: 'Churn risk early warning', description: 'Identify investors/agents showing disengagement patterns', priority: 'P2', status: 'not_started', phase: 3, trigger: 'Activity drop >60% over 14 days', action: 'Trigger re-engagement campaign', kpiImpact: 'Reduce churn 25%' },
];

const EFFICIENCY_KPIS: EfficiencyKPI[] = [
  { label: 'Avg deal stage duration', before: '4.2 days', after: '2.8 days', improvement: '-33%', domain: 'Deal Pipeline' },
  { label: 'Agent response time', before: '3.5 hours', after: '45 min', improvement: '-79%', domain: 'Deal Pipeline' },
  { label: 'Vendor assignment time', before: '6 hours', after: '12 min', improvement: '-97%', domain: 'Vendor Routing' },
  { label: 'SLA compliance rate', before: '62%', after: '88%', improvement: '+42%', domain: 'Vendor Routing' },
  { label: 'Investor inquiry-to-view', before: '18%', after: '32%', improvement: '+78%', domain: 'Investor Intelligence' },
  { label: 'Deal alert engagement', before: '12%', after: '38%', improvement: '+217%', domain: 'Investor Intelligence' },
  { label: 'Anomaly detection speed', before: '8 hours', after: '5 min', improvement: '-99%', domain: 'Growth Monitoring' },
  { label: 'Campaign optimization cycle', before: '7 days', after: '1 day', improvement: '-86%', domain: 'Growth Monitoring' },
];

export function useAutomationChecklist() {
  const [items, setItems] = useState<AutomationItem[]>(AUTOMATION_ITEMS);

  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next: Record<AutomationStatus, AutomationStatus> = {
        not_started: 'planned',
        planned: 'in_progress',
        in_progress: 'deployed',
        deployed: 'deployed',
      };
      return { ...item, status: next[item.status] };
    }));
  };

  const domains = ['Deal Pipeline', 'Vendor Routing', 'Investor Intelligence', 'Growth Monitoring'] as const;

  const domainStats = domains.map(d => {
    const domainItems = items.filter(i => i.domain === d);
    const deployed = domainItems.filter(i => i.status === 'deployed').length;
    return { domain: d, total: domainItems.length, deployed, pct: Math.round((deployed / domainItems.length) * 100) };
  });

  const totalDeployed = items.filter(i => i.status === 'deployed').length;
  const totalPct = Math.round((totalDeployed / items.length) * 100);

  return {
    items,
    toggleStatus,
    domains,
    domainStats,
    efficiencyKPIs: EFFICIENCY_KPIS,
    totalDeployed,
    totalItems: items.length,
    totalPct,
  };
}
