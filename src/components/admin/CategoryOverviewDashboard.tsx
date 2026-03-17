import React, { useMemo, useState } from 'react';
import { navigationSections, sectionTitles } from './navigationSections';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Building2, Wrench, Settings, Cpu, Coins,
  Headphones, ShoppingBag, BarChart3, DollarSign, Globe, Palette, Sparkles,
  TrendingUp, Zap, Layers, ChevronRight,
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

// Accent colors per status — dark-theme exchange style
const statusAccent: Record<StatusKey, { dot: string; text: string; bg: string }> = {
  active:  { dot: 'bg-[#0ecb81]', text: 'text-[#0ecb81]', bg: 'bg-[#0ecb81]/8' },
  new:     { dot: 'bg-[#f0b90b]', text: 'text-[#f0b90b]', bg: 'bg-[#f0b90b]/8' },
  hot:     { dot: 'bg-[#f6465d]', text: 'text-[#f6465d]', bg: 'bg-[#f6465d]/8' },
  premium: { dot: 'bg-[#f0b90b]', text: 'text-[#f0b90b]', bg: 'bg-[#f0b90b]/8' },
};

interface CategoryOverviewDashboardProps {
  category: string;
  onSectionChange?: (section: string) => void;
}

const CategoryOverviewDashboard: React.FC<CategoryOverviewDashboardProps> = ({
  category,
  onSectionChange,
}) => {
  const sections = navigationSections[category as keyof typeof navigationSections] || [];
  const title = sectionTitles[category as keyof typeof sectionTitles] || category;
  const CategoryIcon = categoryIcons[category] || LayoutDashboard;
  const description = categoryDescriptions[category] || '';
  const isFeatures = category === 'features';
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

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
      {/* Header bar */}
      <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/.15)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-4 w-4 text-[#f0b90b]" />
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">{title}</h1>
              <p className="text-[10px] text-muted-foreground/60 mt-px">{description}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
            {contentSections.length} modules
          </span>
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

      {/* Module Grid — compact exchange-style rows */}
      <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/.15)] overflow-hidden">
        {/* Column header */}
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto] px-3 py-1.5 border-b border-[hsl(var(--border)/.08)]">
          <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/40">Module</span>
          <span className="hidden sm:block text-[9px] font-medium uppercase tracking-widest text-muted-foreground/40">Status</span>
          <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/40 text-right">Action</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[hsl(var(--border)/.06)]">
          {contentSections.map((section) => {
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
                  "grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto] items-center gap-2 w-full text-left",
                  "px-3 py-[7px] transition-colors duration-100",
                  isHovered ? "bg-[hsl(var(--foreground)/.03)]" : "bg-transparent"
                )}
              >
                {/* Module name */}
                <div className="flex items-center gap-2 min-w-0 relative">
                  <Icon className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors",
                    isHovered ? "text-[#f0b90b]" : "text-muted-foreground/40"
                  )} />
                  <span className={cn(
                    "text-[11px] font-medium truncate transition-colors",
                    isHovered ? "text-foreground" : "text-foreground/75"
                  )}>
                    {section.label.replace(/^[^\w]*\s/, '')}
                  </span>

                  {/* Hover tooltip */}
                  {isHovered && (
                    <div className="absolute left-6 top-full mt-1 z-50 px-2.5 py-1.5 rounded bg-[hsl(var(--popover))] border border-[hsl(var(--border)/.3)] shadow-xl max-w-[200px] animate-in fade-in zoom-in-95 duration-100">
                      <p className="text-[9px] text-[hsl(var(--popover-foreground)/.7)] leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {accent && (
                    <>
                      <span className={cn("w-1.5 h-1.5 rounded-full", accent.dot)} />
                      <span className={cn("text-[9px] font-semibold uppercase tracking-wider leading-none", accent.text)}>
                        {badgeText.replace(/[^\w\s]/g, '').trim().split(' ')[0] || 'Live'}
                      </span>
                    </>
                  )}
                  {!accent && (
                    <span className="text-[9px] text-muted-foreground/30">—</span>
                  )}
                </div>

                {/* Action arrow */}
                <div className="flex justify-end">
                  <ChevronRight className={cn(
                    "h-3 w-3 transition-all duration-100",
                    isHovered ? "text-[#f0b90b] translate-x-0.5" : "text-muted-foreground/15"
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatChip: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs font-bold font-mono leading-none" style={{ color }}>{value}</span>
    <span className="text-[9px] text-muted-foreground/40 leading-none">{label}</span>
  </div>
);

export default CategoryOverviewDashboard;
