import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Scale, Building2, FileText, Shield, Users, Globe,
  CheckCircle2, ChevronDown, ArrowRight, Layers, Landmark,
  BookOpen, ScrollText, BadgeCheck, Clock, AlertTriangle,
  Banknote, Briefcase, Lock, Eye, Sparkles, BarChart3,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Legal Company Setup & Licensing Roadmap
   Compliant business structure for Indonesian proptech operations
   ═══════════════════════════════════════════════════════════ */

// ── Company Structure ───────────────────────────────────
const companyStructure = {
  entity: 'PT (Perseroan Terbatas)',
  rationale: 'Scalable limited liability company — standard for Indonesian tech startups. Enables equity fundraising, multiple shareholders, and foreign ownership through PMA structure if needed.',
  shareholding: [
    { role: 'Founder / CEO', allocation: '60–70%', notes: 'Majority control with vesting schedule (4-year cliff)', vesting: '4 years, 1-year cliff' },
    { role: 'Co-Founder / CTO', allocation: '15–20%', notes: 'Technical equity with milestone-based vesting', vesting: '4 years, 1-year cliff' },
    { role: 'ESOP Pool', allocation: '10–15%', notes: 'Employee stock option pool for key hires', vesting: 'Reserved for future allocation' },
    { role: 'Investor Reserve', allocation: '0% (dilution-ready)', notes: 'Clean cap table structure for Series A/Seed entry', vesting: 'Allocated upon funding round' },
  ],
  investorPlanning: [
    'Anti-dilution protection clauses for founder shares',
    'Convertible note / SAFE structure for pre-seed',
    'Board seat allocation framework (1 founder, 1 investor, 1 independent)',
    'Tag-along and drag-along rights preparation',
    'Right of first refusal (ROFR) for existing shareholders',
  ],
};

// ── Business Activity Classification (KBLI) ─────────────
const kbliCodes = [
  { code: '63122', activity: 'Digital Property Marketplace Services', description: 'Web portal operations for property listing aggregation, search, and discovery platform', risk: 'Low', priority: 'Primary' },
  { code: '73100', activity: 'Property Marketing & Lead Generation', description: 'Digital advertising, lead capture, and marketing services for property developers and agents', risk: 'Low', priority: 'Primary' },
  { code: '62090', activity: 'Technology-Based Investment Analytics', description: 'AI-powered property valuation, ROI forecasting, and market intelligence SaaS services', risk: 'Medium', priority: 'Primary' },
  { code: '74909', activity: 'Service Marketplace Facilitation', description: 'Platform connecting property buyers with legal, notary, inspection, and renovation service providers', risk: 'Low', priority: 'Secondary' },
  { code: '66190', activity: 'Investment Advisory Support', description: 'Future fractional investment or crowdfunding features — requires additional licensing review', risk: 'High', priority: 'Future' },
];

// ── Licensing Preparation ───────────────────────────────
interface LicenseItem {
  license: string;
  authority: string;
  timeline: string;
  status: 'required' | 'conditional' | 'future';
  details: string[];
  icon: LucideIcon;
}

const licensingItems: LicenseItem[] = [
  {
    license: 'NIB (Nomor Induk Berusaha)',
    authority: 'OSS (Online Single Submission)',
    timeline: 'Week 1-2',
    status: 'required',
    details: ['Business identification number via OSS RBA system', 'Required for all business activities', 'Links to selected KBLI codes', 'Auto-generates basic operating permit'],
    icon: BadgeCheck,
  },
  {
    license: 'PSE (Penyelenggara Sistem Elektronik)',
    authority: 'Kominfo (Ministry of Communication)',
    timeline: 'Week 2-4',
    status: 'required',
    details: ['Electronic system operator registration', 'Required for any platform processing user data', 'Must declare data storage location', 'Annual compliance reporting obligation'],
    icon: Globe,
  },
  {
    license: 'NPWP (Tax Identification)',
    authority: 'DJP (Directorate General of Taxes)',
    timeline: 'Week 1',
    status: 'required',
    details: ['Corporate tax ID registration', 'Required before any revenue activity', 'Enables VAT collection if applicable', 'Links to founder personal NPWP'],
    icon: Landmark,
  },
  {
    license: 'Agent Partnership Agreements',
    authority: 'Licensed REA (Real Estate Agents)',
    timeline: 'Week 3-6',
    status: 'required',
    details: ['Platform does not act as licensed agent directly', 'Partnership MoU with AREBI-licensed agents', 'Commission-sharing agreement templates', 'Compliance with PP 18/2021 on property agents'],
    icon: Users,
  },
  {
    license: 'OJK Sandbox Registration',
    authority: 'OJK (Financial Services Authority)',
    timeline: 'Month 3-6',
    status: 'future',
    details: ['Required if launching fractional investment features', 'Securities crowdfunding license (SCF) pathway', 'Sandbox testing period: 6-12 months', 'Capital adequacy requirements apply'],
    icon: AlertTriangle,
  },
  {
    license: 'PDP Compliance (Data Protection)',
    authority: 'UU PDP (Personal Data Protection Law)',
    timeline: 'Month 1-3',
    status: 'conditional',
    details: ['Compliance with UU No. 27/2022 on Personal Data Protection', 'Appoint Data Protection Officer (DPO)', 'User consent management framework', 'Cross-border data transfer assessment'],
    icon: Lock,
  },
];

// ── Operational Legal Documents ──────────────────────────
const legalDocuments = [
  {
    document: 'Terms of Service (ToS)',
    description: 'Platform usage agreement covering user rights, obligations, dispute resolution, and limitation of liability.',
    sections: ['Platform scope & service description', 'User registration & eligibility', 'Content ownership & licensing', 'Prohibited activities', 'Dispute resolution (arbitration clause)', 'Limitation of liability', 'Governing law (Indonesian jurisdiction)'],
    priority: 'Critical',
    icon: ScrollText,
  },
  {
    document: 'Privacy & Data Protection Policy',
    description: 'UU PDP-compliant policy covering data collection, processing, storage, sharing, and user rights.',
    sections: ['Data collected & legal basis', 'Processing purposes & retention', 'Third-party data sharing', 'User rights (access, rectification, deletion)', 'Cookie & tracking policy', 'Cross-border data transfer', 'Data breach notification procedure'],
    priority: 'Critical',
    icon: Shield,
  },
  {
    document: 'Commission Agreement Template',
    description: 'Standardized agreement for agent/developer commission structures, payment terms, and performance obligations.',
    sections: ['Commission rate & calculation method', 'Payment schedule & milestones', 'Lead attribution & tracking', 'Exclusivity terms (if applicable)', 'Termination & clawback provisions', 'Performance minimum requirements', 'Dispute resolution process'],
    priority: 'High',
    icon: Banknote,
  },
  {
    document: 'Developer Partnership Agreement',
    description: 'Framework for property developer collaborations including listing terms, data access, and co-marketing.',
    sections: ['Listing placement & promotion terms', 'Data sharing & analytics access', 'Lead forwarding SLA', 'Commission structure by tier', 'Intellectual property rights', 'Confidentiality obligations', 'Term & renewal conditions'],
    priority: 'High',
    icon: Briefcase,
  },
];

// ── Compliance Roadmap Timeline ─────────────────────────
const roadmapPhases = [
  {
    phase: 'Foundation',
    timeline: 'Month 1',
    color: '--panel-accent',
    icon: Building2,
    milestones: [
      'PT establishment via notary (Akta Pendirian)',
      'SK Kemenkumham (Ministry approval)',
      'NIB registration via OSS',
      'NPWP corporate tax ID',
      'Bank account opening (corporate)',
      'Founder shareholder agreement execution',
    ],
  },
  {
    phase: 'Licensing',
    timeline: 'Month 1-2',
    color: '--panel-info',
    icon: BadgeCheck,
    milestones: [
      'PSE Kominfo registration',
      'KBLI code alignment verification',
      'Domain & trademark filing (DJKI)',
      'Agent partnership MoU drafting',
      'ToS & Privacy Policy first draft',
    ],
  },
  {
    phase: 'Operational',
    timeline: 'Month 2-3',
    color: '--panel-success',
    icon: Scale,
    milestones: [
      'Legal document finalization & review',
      'Commission agreement template approval',
      'PDP compliance assessment',
      'DPO appointment (internal or external)',
      'Insurance coverage review (E&O, cyber)',
      'Agent onboarding legal workflow live',
    ],
  },
  {
    phase: 'Expansion-Ready',
    timeline: 'Month 3-6',
    color: '--panel-warning',
    icon: Globe,
    milestones: [
      'OJK consultation for fractional features',
      'Regional expansion legal review (SEA)',
      'PMA structure evaluation (foreign capital)',
      'ESOP plan legal documentation',
      'Investor-ready legal data room',
      'Annual compliance calendar established',
    ],
  },
];

// ── Tabs ────────────────────────────────────────────────
type TabKey = 'structure' | 'kbli' | 'licensing' | 'documents' | 'roadmap';

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'structure', label: 'Company Structure', icon: Building2 },
  { key: 'kbli', label: 'Business Classification', icon: Layers },
  { key: 'licensing', label: 'Licensing', icon: BadgeCheck },
  { key: 'documents', label: 'Legal Documents', icon: FileText },
  { key: 'roadmap', label: 'Compliance Roadmap', icon: Clock },
];

// ── Component ───────────────────────────────────────────
const LegalSetupRoadmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('structure');
  const [expandedDoc, setExpandedDoc] = useState<number | null>(0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ── Header ──────────────────────────────── */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Scale className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">
              Legal Setup & Licensing Roadmap
            </h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">
              Compliant business structure for Indonesian proptech operations with investor-ready foundation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Entity', value: 'PT', color: '--panel-accent' },
            { label: 'KBLI Codes', value: '5', color: '--panel-info' },
            { label: 'Licenses', value: '6', color: '--panel-success' },
            { label: 'Legal Docs', value: '4', color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar + Content ───────────────────── */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        <div className="flex items-center gap-px px-2 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.2)]"
                  : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))] hover:bg-[hsl(var(--panel-hover))]"
              )}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* ── Company Structure Tab ────────── */}
          {activeTab === 'structure' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Entity type */}
              <div className="rounded-lg bg-[hsl(var(--panel-accent)/.04)] border border-[hsl(var(--panel-accent)/.15)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-[hsl(var(--panel-accent))]" />
                  <span className="text-[13px] font-bold text-[hsl(var(--panel-text))]">{companyStructure.entity}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[hsl(var(--panel-success)/.1)] text-[hsl(var(--panel-success))]">
                    Recommended
                  </span>
                </div>
                <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{companyStructure.rationale}</p>
              </div>

              {/* Shareholding */}
              <SectionBlock title="Founder Shareholding Allocation" icon={Users}>
                <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
                  {companyStructure.shareholding.map((sh) => (
                    <div key={sh.role} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(var(--panel-hover))] transition-colors">
                      <div className="w-16 shrink-0">
                        <span className="text-[12px] font-bold font-mono text-[hsl(var(--panel-accent))]">{sh.allocation}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[hsl(var(--panel-text))]">{sh.role}</p>
                        <p className="text-[9px] text-[hsl(var(--panel-text-muted))]">{sh.notes}</p>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-[hsl(var(--panel-hover))] text-[hsl(var(--panel-text-muted))] shrink-0">
                        {sh.vesting}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              {/* Investor equity entry */}
              <SectionBlock title="Future Investor Equity Planning" icon={Sparkles}>
                <div className="p-3 space-y-1.5">
                  {companyStructure.investorPlanning.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-2.5 w-2.5 text-[hsl(var(--panel-info))] shrink-0" />
                      <span className="text-[10px] text-[hsl(var(--panel-text-secondary))]">{item}</span>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ── KBLI Classification Tab ──────── */}
          {activeTab === 'kbli' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="divide-y divide-[hsl(var(--panel-border-subtle))] rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                {kbliCodes.map((kbli) => (
                  <div key={kbli.code} className="flex items-start gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover))] transition-colors">
                    <div className="flex items-center justify-center w-10 h-6 rounded bg-[hsl(var(--panel-hover))] shrink-0">
                      <span className="text-[10px] font-bold font-mono text-[hsl(var(--panel-accent))]">{kbli.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{kbli.activity}</p>
                        <span className={cn(
                          "text-[7px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          kbli.priority === 'Primary' ? "bg-[hsl(var(--panel-success)/.1)] text-[hsl(var(--panel-success))]"
                            : kbli.priority === 'Secondary' ? "bg-[hsl(var(--panel-info)/.1)] text-[hsl(var(--panel-info))]"
                            : "bg-[hsl(var(--panel-warning)/.1)] text-[hsl(var(--panel-warning))]"
                        )}>
                          {kbli.priority}
                        </span>
                      </div>
                      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mt-0.5">{kbli.description}</p>
                    </div>
                    <span className={cn(
                      "text-[8px] font-semibold px-1.5 py-0.5 rounded shrink-0",
                      kbli.risk === 'Low' ? "bg-[hsl(var(--panel-success)/.1)] text-[hsl(var(--panel-success))]"
                        : kbli.risk === 'Medium' ? "bg-[hsl(var(--panel-warning)/.1)] text-[hsl(var(--panel-warning))]"
                        : "bg-[hsl(var(--panel-error)/.1)] text-[hsl(var(--panel-error))]"
                    )}>
                      {kbli.risk} Risk
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-[hsl(var(--panel-warning)/.04)] border border-[hsl(var(--panel-warning)/.15)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
                  <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
                    KBLI 66190 (Investment Advisory) requires OJK consultation before activation. Reserve for post-product-market-fit phase when fractional investment features are ready.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Licensing Tab ────────────────── */}
          {activeTab === 'licensing' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {licensingItems.map((lic) => (
                <div key={lic.license} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.15)]">
                      <lic.icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{lic.license}</h4>
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{lic.authority}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[hsl(var(--panel-info))] shrink-0">{lic.timeline}</span>
                    <span className={cn(
                      "text-[7px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
                      lic.status === 'required' ? "bg-[hsl(var(--panel-error)/.1)] text-[hsl(var(--panel-error))]"
                        : lic.status === 'conditional' ? "bg-[hsl(var(--panel-warning)/.1)] text-[hsl(var(--panel-warning))]"
                        : "bg-[hsl(var(--panel-info)/.1)] text-[hsl(var(--panel-info))]"
                    )}>
                      {lic.status}
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    {lic.details.map((d, di) => (
                      <div key={di} className="flex items-center gap-1.5">
                        <ArrowRight className="h-2 w-2 text-[hsl(var(--panel-accent)/.5)]" />
                        <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Legal Documents Tab ──────────── */}
          {activeTab === 'documents' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {legalDocuments.map((doc, i) => {
                const isExpanded = expandedDoc === i;
                return (
                  <button
                    key={i}
                    onClick={() => setExpandedDoc(isExpanded ? null : i)}
                    className="w-full text-left rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden hover:border-[hsl(var(--panel-accent)/.2)] transition-colors"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.15)] shrink-0">
                        <doc.icon className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{doc.document}</h4>
                          <span className={cn(
                            "text-[7px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            doc.priority === 'Critical'
                              ? "bg-[hsl(var(--panel-error)/.1)] text-[hsl(var(--panel-error))]"
                              : "bg-[hsl(var(--panel-warning)/.1)] text-[hsl(var(--panel-warning))]"
                          )}>
                            {doc.priority}
                          </span>
                        </div>
                        <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mt-0.5">{doc.description}</p>
                      </div>
                      <ChevronDown className={cn("h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))] transition-transform shrink-0", isExpanded && "rotate-180")} />
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="ml-10 space-y-1">
                          <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Key Sections</span>
                          {doc.sections.map((sec, si) => (
                            <div key={si} className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-2.5 w-2.5 text-[hsl(var(--panel-success))]" />
                              <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{sec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Compliance Roadmap Tab ────────── */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Phase progress bar */}
              <div className="flex items-center gap-1 mb-2">
                {roadmapPhases.map((phase, i) => (
                  <React.Fragment key={phase.phase}>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `hsl(var(${phase.color}) / 0.15)` }}>
                      <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: `hsl(var(${phase.color}))`, boxShadow: `0 0 6px hsl(var(${phase.color}) / 0.3)` }} />
                    </div>
                    {i < roadmapPhases.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-[hsl(var(--panel-text-muted))] shrink-0" />}
                  </React.Fragment>
                ))}
              </div>

              {roadmapPhases.map((phase) => (
                <div key={phase.phase} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))]" style={{ backgroundColor: `hsl(var(${phase.color}) / 0.03)` }}>
                    <div
                      className="flex items-center justify-center w-6 h-6 rounded-md border shrink-0"
                      style={{ backgroundColor: `hsl(var(${phase.color}) / 0.1)`, borderColor: `hsl(var(${phase.color}) / 0.2)` }}
                    >
                      <phase.icon className="h-3 w-3" style={{ color: `hsl(var(${phase.color}))` }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{phase.phase}</h4>
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{phase.timeline}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: `hsl(var(${phase.color}))` }}>{phase.milestones.length} milestones</span>
                  </div>
                  <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
                    {phase.milestones.map((ms, mi) => (
                      <div key={mi} className="flex items-center gap-2.5 px-4 py-2 hover:bg-[hsl(var(--panel-hover))] transition-colors">
                        <span className="text-[9px] font-mono font-bold w-4 text-center" style={{ color: `hsl(var(${phase.color}) / 0.5)` }}>{mi + 1}</span>
                        <span className="text-[10px] text-[hsl(var(--panel-text-secondary))]">{ms}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Final goal note */}
              <div className="rounded-lg bg-[hsl(var(--panel-accent)/.03)] border border-[hsl(var(--panel-accent)/.12)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
                  <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
                    Final goal: Legally compliant operational foundation maintaining flexibility for regional expansion and future funding rounds.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Legal Setup & Licensing Roadmap v1.0 — Indonesian proptech compliance framework
      </p>
    </div>
  );
};

/* ── Reusable Section Block ──────────────────────────── */
const SectionBlock: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
      <Icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
      <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{title}</span>
    </div>
    {children}
  </div>
);

export default LegalSetupRoadmap;
