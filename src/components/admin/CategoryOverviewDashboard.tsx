import React, { useMemo, useState } from 'react';
import { navigationSections, sectionTitles } from './navigationSections';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Building2, Wrench, Settings, Cpu, Coins,
  Headphones, ShoppingBag, BarChart3, DollarSign, Globe, Palette, Sparkles,
  TrendingUp, Zap, Layers, ChevronRight, List, LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard, "investor-management": Globe, "transactions": DollarSign,
  "astra-token": Coins, "tools": Wrench, "core-management": Building2,
  "customer-service": Headphones, "user-management": Users, "vendor-management": ShoppingBag,
  "analytics-monitoring": BarChart3, "content-settings": Palette, "system-settings": Settings,
  "technical": Cpu, "features": Sparkles, "help": LayoutDashboard,
};

const categoryDescriptions: Record<string, string> = {
  "investor-management": "Manage foreign & domestic investors, AI scoring engines, deal detection, and market intelligence.",
  "transactions": "Transaction processing, mortgage management, blockchain, B2B marketplace, and partnership programs.",
  "astra-token": "ASTRA token analytics, settings, user activity, and webhook configuration.",
  "tools": "API rate limiting, data backup, usage analytics, and scheduled reports.",
  "core-management": "Property listings, bookings, rentals, notifications, content moderation, and maintenance.",
  "customer-service": "Customer service tickets, contact forms, and live chat management.",
  "user-management": "User accounts, roles, membership levels, KYC verification, and upgrade applications.",
  "vendor-management": "Vendor services, categories, KYC, analytics, and control panel.",
  "analytics-monitoring": "Traffic analytics, AI performance, revenue metrics, engagement, and compliance monitoring.",
  "content-settings": "Website design, homepage sliders, carousels, social media, and SEO management.",
  "system-settings": "System configuration, SMTP, payments, API keys, security, and infrastructure settings.",
  "technical": "Database management, security monitoring, error logs, diagnostics, and system health.",
  "features": "Growth campaigns, mobile enhancements, social commerce, automation, and innovation lab.",
  "help": "Help articles, documentation, changelogs, and system announcements.",
};

type StatusKey = 'active' | 'new' | 'hot' | 'premium';

const badgeStatusMap: Record<string, StatusKey> = {
  'New': 'new', '🔥 Hot': 'hot', 'Premium': 'premium',
  '🚀 Launch': 'active', '📈 Growth': 'active', '🎯 Agents': 'active',
  '📦 Supply': 'active', '📈 Investors': 'active', '🎬 Content': 'active',
  '🤝 Partnerships': 'active', '👑 Authority': 'active', '💰 Revenue': 'active',
  '🎯 Fundraising': 'active', '🏘️ Community': 'active', '🗺️ National': 'active',
  '👤 Personal Brand': 'active', '👥 Team': 'active', '🤝 Hiring': 'active',
  '📈 Growth Hire': 'active', '🏗️ Supply Hire': 'active', '💚 Success Hire': 'active',
  '🏛️ Org Design': 'active', '💰 Budget Plan': 'active', '🚀 Fundraise': 'active',
  '⏱️ Routine': 'active', '📰 PR Plan': 'active', '📧 Outreach': 'active',
  '⚡ Daily': 'active', '🔥 30-Day Sprint': 'hot', '🎯 90-Day Plan': 'active',
  '🎨 Design System': 'active', '🏠 Homepage': 'active', '🔍 Audit': 'active',
};

const statusAccent: Record<StatusKey, { dot: string; text: string; glow: string }> = {
  active:  { dot: 'bg-[hsl(var(--panel-success))]', text: 'text-[hsl(var(--panel-success))]', glow: 'shadow-[0_0_4px_hsl(var(--panel-success)/.3)]' },
  new:     { dot: 'bg-[hsl(var(--panel-accent))]', text: 'text-[hsl(var(--panel-accent))]', glow: 'shadow-[0_0_4px_hsl(var(--panel-accent)/.3)]' },
  hot:     { dot: 'bg-[hsl(var(--panel-danger))]', text: 'text-[hsl(var(--panel-danger))]', glow: 'shadow-[0_0_4px_hsl(var(--panel-danger)/.3)]' },
  premium: { dot: 'bg-[hsl(var(--panel-accent))]', text: 'text-[hsl(var(--panel-accent))]', glow: 'shadow-[0_0_4px_hsl(var(--panel-accent)/.3)]' },
};

type ViewMode = 'list' | 'grid';

interface CategoryOverviewDashboardProps {
  category: string;
  onSectionChange?: (section: string) => void;
}

const CategoryOverviewDashboard: React.FC<CategoryOverviewDashboardProps> = ({
  category, onSectionChange,
}) => {
  const sections = navigationSections[category as keyof typeof navigationSections] || [];
  const title = sectionTitles[category as keyof typeof sectionTitles] || category;
  const CategoryIcon = categoryIcons[category] || LayoutDashboard;
  const description = categoryDescriptions[category] || '';
  const isFeatures = category === 'features';
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const contentSections = sections.filter(s => !s.key.endsWith('-overview'));

  const analytics = useMemo(() => {
    if (!isFeatures) return null;
    const badges = contentSections.map(s => ('badge' in s ? String(s.badge || '') : ''));
    const newCount = badges.filter(b => b === 'New').length;
    const hotCount = badges.filter(b => b.includes('🔥')).length;
    const premiumCount = badges.filter(b => b === 'Premium').length;
    return { total: contentSections.length, newCount, hotCount, premiumCount, activeCount: contentSections.length - newCount };
  }, [isFeatures, contentSections]);

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Header */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-4 py-3"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
              <CategoryIcon className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[hsl(var(--panel-text))] tracking-tight">{title}</h1>
              <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] mt-px">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[hsl(var(--panel-text-muted))] tabular-nums">
              {contentSections.length}
            </span>
            {/* View toggle */}
            <div className="flex items-center border border-[hsl(var(--panel-border))] rounded-md overflow-hidden bg-[hsl(var(--panel-bg))]">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1 transition-all",
                  viewMode === 'list'
                    ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] shadow-[inset_0_0_6px_hsl(var(--panel-accent)/.08)]"
                    : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))]"
                )}
              >
                <List className="h-3 w-3" />
              </button>
              <div className="w-px h-3 bg-[hsl(var(--panel-border))]" />
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1 transition-all",
                  viewMode === 'grid'
                    ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] shadow-[inset_0_0_6px_hsl(var(--panel-accent)/.08)]"
                    : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))]"
                )}
              >
                <LayoutGrid className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {isFeatures && analytics && (
          <div className="flex items-center gap-5 mt-2.5 pt-2.5 border-t border-[hsl(var(--panel-border-subtle))]">
            <StatChip value={analytics.total} label="Total" accentVar="--panel-text-secondary" />
            <StatChip value={analytics.activeCount} label="Active" accentVar="--panel-success" />
            <StatChip value={analytics.hotCount} label="Hot" accentVar="--panel-danger" />
            <StatChip value={analytics.newCount} label="New" accentVar="--panel-accent" />
          </div>
        )}
      </div>

      {/* Modules */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        {viewMode === 'list' ? (
          <ListView
            sections={contentSections}
            hoveredKey={hoveredKey}
            setHoveredKey={setHoveredKey}
            onSectionChange={onSectionChange}
          />
        ) : (
          <GridView
            sections={contentSections}
            hoveredKey={hoveredKey}
            setHoveredKey={setHoveredKey}
            onSectionChange={onSectionChange}
          />
        )}
      </div>
    </div>
  );
};

/* ── List View ─────────────────────────────────────────────── */
const ListView: React.FC<{
  sections: any[];
  hoveredKey: string | null;
  setHoveredKey: (k: string | null) => void;
  onSectionChange?: (s: string) => void;
}> = ({ sections, hoveredKey, setHoveredKey, onSectionChange }) => (
  <>
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_80px_auto] px-3 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.5)]">
      <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--panel-text-muted))]">Module</span>
      <span className="hidden sm:block text-[8px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--panel-text-muted))]">Status</span>
      <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--panel-text-muted))] text-right pr-1">→</span>
    </div>
    <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
      {sections.map((section) => {
        const Icon = section.icon;
        const badgeText = 'badge' in section ? String(section.badge || '') : '';
        const status = badgeStatusMap[badgeText] || (badgeText ? 'active' : undefined);
        const accent = status ? statusAccent[status] : null;
        const isHovered = hoveredKey === section.key;

        return (
          <button
            key={section.key}
            onClick={() => onSectionChange?.(section.key)}
            onMouseEnter={() => setHoveredKey(section.key)}
            onMouseLeave={() => setHoveredKey(null)}
            className={cn(
              "relative grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_80px_auto] items-center w-full text-left",
              "px-3 py-[7px] transition-all duration-100",
              isHovered
                ? "bg-[hsl(var(--panel-hover))] border-l-2 border-l-[hsl(var(--panel-accent)/.6)]"
                : "border-l-2 border-l-transparent"
            )}
            style={isHovered ? { boxShadow: 'inset 0 0 20px hsl(var(--panel-accent) / 0.02)' } : undefined}
          >
            {/* Module */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-all border",
                isHovered
                  ? "bg-[hsl(var(--panel-accent)/.1)] border-[hsl(var(--panel-accent)/.2)]"
                  : "bg-[hsl(var(--panel-hover)/.6)] border-[hsl(var(--panel-border-subtle))]"
              )}>
                <Icon className={cn("h-3 w-3 transition-colors", isHovered ? "text-[hsl(var(--panel-accent))]" : "text-[hsl(var(--panel-text-secondary))]")} />
              </div>
              <div className="min-w-0">
                <span className={cn("text-[11px] font-medium truncate block transition-colors", isHovered ? "text-[hsl(var(--panel-accent))]" : "text-[hsl(var(--panel-text))]")}>
                  {section.label.replace(/^[^\w]*\s/, '')}
                </span>
                <span className="text-[9px] text-[hsl(var(--panel-text-muted))] truncate block leading-tight">
                  {section.description?.slice(0, 50)}{section.description?.length > 50 ? '…' : ''}
                </span>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute left-10 bottom-full mb-1 z-50 px-2.5 py-1.5 rounded-md bg-[hsl(var(--panel-tooltip-bg))] border border-[hsl(var(--panel-tooltip-border))] shadow-xl max-w-[220px] pointer-events-none animate-in fade-in duration-100">
                  <p className="text-[9px] text-[hsl(var(--panel-tooltip-text))] leading-relaxed">{section.description}</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="hidden sm:flex items-center gap-1.5">
              {accent ? (
                <>
                  <span className={cn("w-1.5 h-1.5 rounded-full", accent.dot, accent.glow)} />
                  <span className={cn("text-[8px] font-semibold uppercase tracking-wider", accent.text)}>
                    {badgeText.replace(/[^\w\s]/g, '').trim().split(' ')[0] || 'Live'}
                  </span>
                </>
              ) : (
                <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">—</span>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-end">
              <ChevronRight className={cn("h-2.5 w-2.5 transition-all duration-100", isHovered ? "text-[hsl(var(--panel-accent))] translate-x-0.5" : "text-[hsl(var(--panel-text-muted))]")} />
            </div>
          </button>
        );
      })}
    </div>
  </>
);

/* ── Grid View ─────────────────────────────────────────────── */
const GridView: React.FC<{
  sections: any[];
  hoveredKey: string | null;
  setHoveredKey: (k: string | null) => void;
  onSectionChange?: (s: string) => void;
}> = ({ sections, hoveredKey, setHoveredKey, onSectionChange }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-[hsl(var(--panel-border-subtle))]">
    {sections.map((section) => {
      const Icon = section.icon;
      const badgeText = 'badge' in section ? String(section.badge || '') : '';
      const status = badgeStatusMap[badgeText] || (badgeText ? 'active' : undefined);
      const accent = status ? statusAccent[status] : null;
      const isHovered = hoveredKey === section.key;

      return (
        <button
          key={section.key}
          onClick={() => onSectionChange?.(section.key)}
          onMouseEnter={() => setHoveredKey(section.key)}
          onMouseLeave={() => setHoveredKey(null)}
          className={cn(
            "relative flex flex-col items-center gap-1.5 px-2.5 py-3 text-center transition-all duration-100",
            isHovered ? "bg-[hsl(var(--panel-hover))]" : "bg-[hsl(var(--panel-bg))]"
          )}
          style={isHovered ? { boxShadow: 'inset 0 0 24px hsl(var(--panel-accent) / 0.03)' } : undefined}
        >
          {/* Status dot top-right */}
          {accent && (
            <span className={cn("absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full", accent.dot, accent.glow)} />
          )}

          {/* Icon */}
          <div className={cn(
            "p-2 rounded-lg transition-all border",
            isHovered
              ? "bg-[hsl(var(--panel-accent)/.08)] border-[hsl(var(--panel-accent)/.2)] shadow-[0_0_10px_hsl(var(--panel-accent)/.06)]"
              : "bg-[hsl(var(--panel-hover)/.6)] border-[hsl(var(--panel-border-subtle))]"
          )}>
            <Icon className={cn("h-4 w-4 transition-colors", isHovered ? "text-[hsl(var(--panel-accent))]" : "text-[hsl(var(--panel-text-secondary))]")} />
          </div>

          {/* Title */}
          <span className={cn("text-[10px] font-medium leading-tight line-clamp-2 transition-colors", isHovered ? "text-[hsl(var(--panel-accent))]" : "text-[hsl(var(--panel-text))]")}>
            {section.label.replace(/^[^\w]*\s/, '')}
          </span>

          {/* Short description */}
          <span className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-tight line-clamp-2 max-w-[120px]">
            {section.description?.slice(0, 40)}{section.description?.length > 40 ? '…' : ''}
          </span>

          {/* Hover tooltip */}
          {isHovered && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-50 px-2.5 py-1.5 rounded-md bg-[hsl(var(--panel-tooltip-bg))] border border-[hsl(var(--panel-tooltip-border))] shadow-xl max-w-[200px] pointer-events-none animate-in fade-in duration-100">
              <p className="text-[9px] text-[hsl(var(--panel-tooltip-text))] leading-relaxed text-left">{section.description}</p>
            </div>
          )}
        </button>
      );
    })}
  </div>
);

const StatChip: React.FC<{ value: number; label: string; accentVar: string }> = ({ value, label, accentVar }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs font-bold font-mono leading-none" style={{ color: `hsl(var(${accentVar}))` }}>{value}</span>
    <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-none">{label}</span>
  </div>
);

export default CategoryOverviewDashboard;
