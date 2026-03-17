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

const statusAccent: Record<StatusKey, { dot: string; text: string }> = {
  active:  { dot: 'bg-[#0ecb81]', text: 'text-[#0ecb81]' },
  new:     { dot: 'bg-[#f0b90b]', text: 'text-[#f0b90b]' },
  hot:     { dot: 'bg-[#f6465d]', text: 'text-[#f6465d]' },
  premium: { dot: 'bg-[#f0b90b]', text: 'text-[#f0b90b]' },
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
      <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/.15)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-4 w-4 text-[#f0b90b]" />
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">{title}</h1>
              <p className="text-[10px] text-muted-foreground mt-px">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {contentSections.length}
            </span>
            {/* View toggle */}
            <div className="flex items-center border border-[hsl(var(--border)/.15)] rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1 transition-colors",
                  viewMode === 'list' ? "bg-[#f0b90b]/10 text-[#f0b90b]" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                )}
              >
                <List className="h-3 w-3" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1 transition-colors",
                  viewMode === 'grid' ? "bg-[#f0b90b]/10 text-[#f0b90b]" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                )}
              >
                <LayoutGrid className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {isFeatures && analytics && (
          <div className="flex items-center gap-5 mt-2.5 pt-2.5 border-t border-[hsl(var(--border)/.1)]">
            <StatChip value={analytics.total} label="Total" color="#848e9c" />
            <StatChip value={analytics.activeCount} label="Active" color="#0ecb81" />
            <StatChip value={analytics.hotCount} label="Hot" color="#f6465d" />
            <StatChip value={analytics.newCount} label="New" color="#f0b90b" />
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/.15)] overflow-hidden">
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
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_80px_auto] px-3 py-1.5 border-b border-[hsl(var(--border)/.08)]">
      <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">Module</span>
      <span className="hidden sm:block text-[8px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">Status</span>
      <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70 text-right pr-1">→</span>
    </div>
    <div className="divide-y divide-[hsl(var(--border)/.05)]">
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
              "px-3 py-[6px] transition-colors duration-75",
              isHovered ? "bg-[hsl(var(--foreground)/.02)]" : ""
            )}
          >
            {/* Module */}
            <div className="flex items-center gap-2 min-w-0">
              <Icon className={cn("h-3.5 w-3.5 shrink-0 transition-colors", isHovered ? "text-[#f0b90b]" : "text-muted-foreground")} />
              <div className="min-w-0">
                <span className={cn("text-[11px] font-medium truncate block transition-colors", isHovered ? "text-foreground" : "text-foreground/90")}>
                  {section.label.replace(/^[^\w]*\s/, '')}
                </span>
                <span className="text-[9px] text-muted-foreground truncate block leading-tight">
                  {section.description?.slice(0, 50)}{section.description?.length > 50 ? '…' : ''}
                </span>
              </div>

              {/* Hover tooltip — positioned ABOVE */}
              {isHovered && (
                <div className="absolute left-8 bottom-full mb-1 z-50 px-2.5 py-1.5 rounded bg-popover border border-border/40 shadow-xl max-w-[220px] pointer-events-none animate-in fade-in duration-100">
                  <p className="text-[9px] text-popover-foreground/80 leading-relaxed">{section.description}</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="hidden sm:flex items-center gap-1">
              {accent ? (
                <>
                  <span className={cn("w-1 h-1 rounded-full", accent.dot)} />
                  <span className={cn("text-[8px] font-semibold uppercase tracking-wider", accent.text)}>
                    {badgeText.replace(/[^\w\s]/g, '').trim().split(' ')[0] || 'Live'}
                  </span>
                </>
              ) : (
                <span className="text-[8px] text-muted-foreground/50">—</span>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-end">
              <ChevronRight className={cn("h-2.5 w-2.5 transition-all duration-75", isHovered ? "text-[#f0b90b] translate-x-0.5" : "text-muted-foreground/30")} />
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
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-[hsl(var(--border)/.06)]">
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
            "relative flex flex-col items-center gap-1.5 px-2.5 py-3 text-center transition-colors duration-75",
            isHovered ? "bg-[hsl(var(--foreground)/.03)]" : "bg-[hsl(var(--card))]"
          )}
        >
          {/* Status dot top-right */}
          {accent && (
            <span className={cn("absolute top-1.5 right-1.5 w-1 h-1 rounded-full", accent.dot)} />
          )}

          {/* Icon */}
          <div className={cn(
            "p-1.5 rounded-lg transition-colors",
            isHovered ? "bg-[#f0b90b]/10" : "bg-muted/50"
          )}>
            <Icon className={cn("h-4 w-4 transition-colors", isHovered ? "text-[#f0b90b]" : "text-muted-foreground")} />
          </div>

          {/* Title */}
          <span className={cn("text-[10px] font-medium leading-tight line-clamp-2 transition-colors", isHovered ? "text-foreground" : "text-foreground/85")}>
            {section.label.replace(/^[^\w]*\s/, '')}
          </span>

          {/* Short description */}
          <span className="text-[8px] text-muted-foreground/30 leading-tight line-clamp-2 max-w-[120px]">
            {section.description?.slice(0, 40)}{section.description?.length > 40 ? '…' : ''}
          </span>

          {/* Hover tooltip — positioned ABOVE */}
          {isHovered && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-50 px-2 py-1 rounded bg-[hsl(var(--popover)/.92)] border border-[hsl(var(--border)/.12)] shadow-lg max-w-[180px] pointer-events-none animate-in fade-in duration-100">
              <p className="text-[8px] text-[hsl(var(--popover-foreground)/.55)] leading-relaxed text-left">{section.description}</p>
            </div>
          )}
        </button>
      );
    })}
  </div>
);

const StatChip: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs font-bold font-mono leading-none" style={{ color }}>{value}</span>
    <span className="text-[9px] text-muted-foreground/40 leading-none">{label}</span>
  </div>
);

export default CategoryOverviewDashboard;
