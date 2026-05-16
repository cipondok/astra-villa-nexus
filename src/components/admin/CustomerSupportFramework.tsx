import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  HeadphonesIcon, MessageSquare, Mail, Phone, ArrowRight, CheckCircle2,
  Clock, Users, BarChart3, BookOpen, Zap, Shield, Star, Tag,
  ChevronDown, ChevronUp, Layers, AlertTriangle, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Customer Support Operating Framework
   ═══════════════════════════════════════════════════════════ */

type Tab = 'channels' | 'workflow' | 'knowledge' | 'sla' | 'metrics';

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'channels', label: 'Support Channels', icon: MessageSquare },
  { id: 'workflow', label: 'Ticket Workflow', icon: Layers },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'sla', label: 'SLA & Escalation', icon: Shield },
  { id: 'metrics', label: 'Success Metrics', icon: BarChart3 },
];

/* ─── Channel data ─── */
const channels = [
  {
    name: 'In-Platform Chat Widget', icon: MessageSquare, color: '--panel-accent',
    availability: '24/7 AI + business hours human',
    audiences: ['All users', 'Investors', 'Agents', 'Developers'],
    features: ['AI-first triage with handoff to human agent', 'Context-aware — knows user role, current page, and property being viewed', 'Quick-reply templates for common queries', 'File attachment for screenshots and documents', 'Conversation history preserved across sessions'],
    responseTarget: '< 30 seconds (AI) / < 5 min (human)',
  },
  {
    name: 'Email Ticket System', icon: Mail, color: '--panel-info',
    availability: 'Monitored 7 days/week',
    audiences: ['All users', 'Partnership inquiries', 'Legal escalations'],
    features: ['Auto-categorization by subject keywords', 'Ticket ID tracking with status updates via email', 'Priority routing for transaction-related issues', 'Attachment support for legal documents and contracts', 'SLA-tracked response and resolution times'],
    responseTarget: '< 2 hours (first response) / < 24 hours (resolution)',
  },
  {
    name: 'Phone Consultation', icon: Phone, color: '--panel-success',
    availability: 'By appointment — Mon–Fri 9AM–5PM WIB',
    audiences: ['Premium subscribers', 'High-value transactions (>IDR 5B)', 'Developer partners'],
    features: ['Scheduled via in-app booking system', 'Dedicated relationship manager for premium users', 'Transaction-specific consultation with property specialists', 'Post-call summary emailed to user', 'Recorded for quality and training (with consent)'],
    responseTarget: 'Same-day callback / scheduled within 24 hours',
  },
];

/* ─── Workflow stages ─── */
const workflowStages = [
  { stage: 'Inquiry Received', icon: MessageSquare, color: '--panel-accent', description: 'User submits via chat, email, or phone request', details: ['Auto-acknowledge within 30 seconds', 'Capture user role, context page, and device info', 'Generate unique ticket ID', 'Log in support CRM'] },
  { stage: 'Ticket Categorized', icon: Tag, color: '--panel-info', description: 'AI + rules engine classifies the inquiry', details: ['Categories: Listing, Transaction, Legal, Technical, Account, Billing', 'Priority assigned: P1 (Critical) → P4 (Low)', 'Sub-category tagging for analytics', 'Auto-route to relevant specialist queue'] },
  { stage: 'Assigned to Specialist', icon: Users, color: '--panel-warning', description: 'Routed to the right team member', details: ['Round-robin within specialist pool', 'Skill-based routing (legal → legal team, tech → engineering)', 'Load balancing across available agents', 'VIP flag for premium subscribers and developer partners'] },
  { stage: 'Resolution Tracking', icon: Clock, color: '--panel-success', description: 'Active work with user visibility', details: ['Real-time status updates in user dashboard', 'Internal notes and collaboration between specialists', 'Escalation triggers if SLA breach approaching', 'User notification at each stage transition'] },
  { stage: 'Feedback & Closure', icon: Star, color: '--panel-accent', description: 'Close loop and capture satisfaction', details: ['5-star rating + optional comment', 'Auto-close after 48 hours of no response', 'Satisfaction survey for resolved tickets', 'Feed insights into knowledge base improvements'] },
];

/* ─── Knowledge base categories ─── */
const kbCategories = [
  {
    category: 'Property Transactions', icon: Shield, color: '--panel-accent', articleCount: 15,
    articles: ['How to make an offer on a property', 'Understanding SHM vs SHGB certificates', 'Step-by-step guide to the AJB process', 'Down payment and installment options', 'Tax obligations for property buyers'],
  },
  {
    category: 'Listing Management', icon: BookOpen, color: '--panel-info', articleCount: 12,
    articles: ['How to upload your first property listing', 'Photo guidelines for maximum engagement', 'Setting the right asking price', 'Managing inquiries and viewings', 'Updating listing status and details'],
  },
  {
    category: 'Investor Intelligence', icon: BarChart3, color: '--panel-success', articleCount: 10,
    articles: ['Understanding your Investment Score', 'How AI price predictions work', 'Using the Deal Finder effectively', 'Portfolio Builder walkthrough', 'Market trends and growth zone analysis'],
  },
  {
    category: 'Account & Billing', icon: Users, color: '--panel-warning', articleCount: 8,
    articles: ['Creating and verifying your account', 'Subscription plans and features', 'Managing payment methods', 'Upgrading or downgrading your plan', 'Referral program guide'],
  },
];

/* ─── SLA tiers ─── */
const slaTiers = [
  { priority: 'P1 — Critical', color: '--panel-error', examples: 'Transaction blocked, payment failure, security breach', firstResponse: '15 min', resolution: '2 hours', escalation: 'Auto-escalate to team lead after 30 min' },
  { priority: 'P2 — High', color: '--panel-warning', examples: 'Listing errors, legal document issues, agent disputes', firstResponse: '1 hour', resolution: '8 hours', escalation: 'Auto-escalate after 4 hours' },
  { priority: 'P3 — Medium', color: '--panel-info', examples: 'Feature questions, account settings, subscription inquiries', firstResponse: '4 hours', resolution: '24 hours', escalation: 'Auto-escalate after 12 hours' },
  { priority: 'P4 — Low', color: '--panel-accent', examples: 'General feedback, feature requests, enhancement suggestions', firstResponse: '24 hours', resolution: '72 hours', escalation: 'Weekly review batch' },
];

/* ─── Metrics ─── */
const metrics = [
  { metric: 'First Response Time', target: '< 5 min (chat) / < 2 hr (email)', current: 'Baseline TBD', color: '--panel-accent' },
  { metric: 'Resolution Time', target: '< 4 hours avg', current: 'Baseline TBD', color: '--panel-info' },
  { metric: 'CSAT Score', target: '≥ 4.5 / 5.0', current: 'Baseline TBD', color: '--panel-success' },
  { metric: 'First Contact Resolution', target: '≥ 70%', current: 'Baseline TBD', color: '--panel-warning' },
  { metric: 'Ticket Volume / Week', target: 'Monitor trend', current: 'Baseline TBD', color: '--panel-accent' },
  { metric: 'Escalation Rate', target: '< 15%', current: 'Baseline TBD', color: '--panel-error' },
  { metric: 'Knowledge Base Deflection', target: '≥ 40%', current: 'Baseline TBD', color: '--panel-info' },
  { metric: 'NPS (Support)', target: '≥ 50', current: 'Baseline TBD', color: '--panel-success' },
];

const roleSegments = [
  { role: 'Investors', needs: 'Portfolio analytics help, deal questions, subscription billing', priority: 'High — revenue-driving users' },
  { role: 'Agents', needs: 'Listing management, CRM tools, commission tracking', priority: 'High — supply-side partners' },
  { role: 'Developers', needs: 'Partnership onboarding, promotion packages, launch coordination', priority: 'Medium — B2B relationships' },
  { role: 'Service Providers', needs: 'Vendor profile setup, quotation system, service fulfillment', priority: 'Medium — marketplace ecosystem' },
];

const CustomerSupportFramework: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('channels');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggle = (key: string) => setExpandedItem(expandedItem === key ? null : key);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <HeadphonesIcon className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Customer Support Operating Framework</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Multi-channel support strategy for investors, agents, developers, and service providers</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Channels', value: '3', color: '--panel-accent' },
            { label: 'Workflow Steps', value: '5', color: '--panel-info' },
            { label: 'KB Categories', value: String(kbCategories.length), color: '--panel-success' },
            { label: 'SLA Tiers', value: '4', color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Segments */}
      <div className="grid grid-cols-4 gap-3">
        {roleSegments.map((seg) => (
          <div key={seg.role} className="rounded-lg bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
            <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">{seg.role}</span>
            <p className="text-[8px] text-[hsl(var(--panel-text-muted))] mt-1 leading-relaxed">{seg.needs}</p>
            <span className="text-[7px] mt-1.5 inline-block px-1.5 py-0.5 rounded-full bg-[hsl(var(--panel-accent)/.06)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.15)] font-medium">{seg.priority}</span>
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-px px-2 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)] overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setExpandedItem(null); }} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.2)]"
                : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))] hover:bg-[hsl(var(--panel-hover))]"
            )}>
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* ── Channels ── */}
          {activeTab === 'channels' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {channels.map((ch) => {
                const isOpen = expandedItem === ch.name;
                return (
                  <div key={ch.name} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                    <button onClick={() => toggle(ch.name)} className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--panel-hover)/.2)] hover:bg-[hsl(var(--panel-hover)/.4)] transition-colors text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md" style={{ backgroundColor: `hsl(var(${ch.color}) / 0.08)`, border: `1px solid hsl(var(${ch.color}) / 0.2)` }}>
                          <ch.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${ch.color}))` }} />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{ch.name}</span>
                          <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">Response: {ch.responseTarget}</span>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" /> : <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" />}
                    </button>
                    {isOpen && (
                      <div className="grid grid-cols-3 divide-x divide-[hsl(var(--panel-border-subtle))] border-t border-[hsl(var(--panel-border-subtle))] animate-in fade-in duration-200">
                        <div className="p-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-accent))] block mb-1.5">Availability</span>
                          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{ch.availability}</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-accent))] block mt-2 mb-1">Audiences</span>
                          <div className="flex flex-wrap gap-1">{ch.audiences.map((a) => <span key={a} className="text-[8px] px-1.5 py-0.5 rounded-md bg-[hsl(var(--panel-hover))] text-[hsl(var(--panel-text-secondary))] border border-[hsl(var(--panel-border-subtle))]">{a}</span>)}</div>
                        </div>
                        <div className="p-3 col-span-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-info))] block mb-1.5">Features</span>
                          <div className="space-y-1">{ch.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5"><CheckCircle2 className="h-2 w-2 shrink-0 mt-0.5 text-[hsl(var(--panel-info)/.5)]" /><span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{f}</span></div>
                          ))}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Workflow ── */}
          {activeTab === 'workflow' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              {workflowStages.map((ws, idx) => {
                const isOpen = expandedItem === ws.stage;
                return (
                  <div key={ws.stage} className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ backgroundColor: `hsl(var(${ws.color}) / 0.1)`, border: `1px solid hsl(var(${ws.color}) / 0.25)` }}>
                        <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${ws.color}))` }}>{idx + 1}</span>
                      </div>
                      {idx < workflowStages.length - 1 && <div className="w-px h-full min-h-[20px] bg-[hsl(var(--panel-border-subtle))]" />}
                    </div>
                    <div className="flex-1 rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden mb-1">
                      <button onClick={() => toggle(ws.stage)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-[hsl(var(--panel-hover)/.2)] transition-colors text-left">
                        <div>
                          <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))]">{ws.stage}</span>
                          <span className="text-[9px] text-[hsl(var(--panel-text-muted))] ml-2">{ws.description}</span>
                        </div>
                        {isOpen ? <ChevronUp className="h-3 w-3 text-[hsl(var(--panel-text-muted))]" /> : <ChevronDown className="h-3 w-3 text-[hsl(var(--panel-text-muted))]" />}
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-2.5 border-t border-[hsl(var(--panel-border-subtle))] pt-2 animate-in fade-in duration-200">
                          <div className="space-y-1">{ws.details.map((d, i) => (
                            <div key={i} className="flex items-start gap-1.5"><ArrowRight className="h-2 w-2 shrink-0 mt-0.5" style={{ color: `hsl(var(${ws.color}) / 0.5)` }} /><span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{d}</span></div>
                          ))}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Knowledge Base ── */}
          {activeTab === 'knowledge' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {kbCategories.map((kb) => {
                const isOpen = expandedItem === kb.category;
                return (
                  <div key={kb.category} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                    <button onClick={() => toggle(kb.category)} className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--panel-hover)/.2)] hover:bg-[hsl(var(--panel-hover)/.4)] transition-colors text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ backgroundColor: `hsl(var(${kb.color}) / 0.08)`, border: `1px solid hsl(var(${kb.color}) / 0.2)` }}>
                          <kb.icon className="h-3 w-3" style={{ color: `hsl(var(${kb.color}))` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))]">{kb.category}</span>
                        <span className="text-[9px] font-mono text-[hsl(var(--panel-text-muted))]">{kb.articleCount} articles</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" /> : <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 border-t border-[hsl(var(--panel-border-subtle))] pt-2.5 animate-in fade-in duration-200">
                        <div className="space-y-1.5">{kb.articles.map((a, i) => (
                          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[hsl(var(--panel-hover)/.15)]">
                            <BookOpen className="h-2.5 w-2.5 shrink-0" style={{ color: `hsl(var(${kb.color}) / 0.5)` }} />
                            <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{a}</span>
                          </div>
                        ))}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SLA ── */}
          {activeTab === 'sla' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {slaTiers.map((sla) => (
                <div key={sla.priority} className="rounded-lg border p-3" style={{ borderColor: `hsl(var(${sla.color}) / 0.2)`, backgroundColor: `hsl(var(${sla.color}) / 0.02)` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold" style={{ color: `hsl(var(${sla.color}))` }}>{sla.priority}</span>
                    <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{sla.examples}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="px-2 py-1.5 rounded-md bg-[hsl(var(--panel-hover)/.3)]">
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))] block">First Response</span>
                      <span className="text-[10px] font-bold font-mono text-[hsl(var(--panel-text))]">{sla.firstResponse}</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md bg-[hsl(var(--panel-hover)/.3)]">
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))] block">Resolution</span>
                      <span className="text-[10px] font-bold font-mono text-[hsl(var(--panel-text))]">{sla.resolution}</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md bg-[hsl(var(--panel-hover)/.3)]">
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))] block">Escalation</span>
                      <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{sla.escalation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Metrics ── */}
          {activeTab === 'metrics' && (
            <div className="animate-in fade-in duration-200">
              <div className="grid grid-cols-4 gap-3">
                {metrics.map((m) => (
                  <div key={m.metric} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] p-3">
                    <span className="text-[9px] font-semibold text-[hsl(var(--panel-text))] block mb-1">{m.metric}</span>
                    <span className="text-[11px] font-bold font-mono block" style={{ color: `hsl(var(${m.color}))` }}>{m.target}</span>
                    <span className="text-[8px] text-[hsl(var(--panel-text-muted))] mt-1 block">{m.current}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Customer Support Framework v1.0 — Structured to scale from founder-handled to dedicated support team
      </p>
    </div>
  );
};

export default CustomerSupportFramework;
