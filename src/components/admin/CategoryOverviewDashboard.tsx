import React, { useMemo, useState } from 'react';
import { navigationSections, sectionTitles } from './navigationSections';
import { Badge } from '@/components/ui/badge';
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

const statusDot: Record<StatusKey, string> = {
  active: 'bg-emerald-500',
  new: 'bg-primary',
  hot: 'bg-orange-500',
  premium: 'bg-amber-500',
};

const statusBadgeStyle: Record<StatusKey, string> = {
  active: 'bg-emerald-500/8 text-emerald-600 dark:text-emerald-400',
  new: 'bg-primary/8 text-primary',
  hot: 'bg-orange-500/8 text-orange-600 dark:text-orange-400',
  premium: 'bg-amber-500/8 text-amber-600 dark:text-amber-400',
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
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-r from-card via-card to-primary/[0.02] px-5 py-4">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/[0.04] rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
              <CategoryIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">{title}</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-md">{description}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/70 tabular-nums shrink-0">
            {contentSections.length} modules
          </span>
        </div>

        {isFeatures && analytics && (
          <div className="relative flex items-center gap-6 mt-3 pt-3 border-t border-border/20">
            <StatPill icon={Layers} value={analytics.total} label="Total" />
            <StatPill icon={Zap} value={analytics.activeCount} label="Active" color="text-emerald-500" />
            <StatPill icon={TrendingUp} value={analytics.hotCount} label="Hot" color="text-orange-500" />
            <StatPill icon={Sparkles} value={analytics.newCount} label="New" color="text-primary" />
            {analytics.premiumCount > 0 && (
              <StatPill icon={Coins} value={analytics.premiumCount} label="Premium" color="text-amber-500" />
            )}
          </div>
        )}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
        {contentSections.map((section, idx) => {
          const Icon = section.icon;
          const badgeText = 'badge' in section ? String(section.badge || '') : '';
          const status = badgeStatusMap[badgeText] || (badgeText ? 'active' : undefined);
          const isHovered = hoveredKey === section.key;

          return (
            <button
              key={section.key}
              onClick={() => onSectionChange?.(section.key)}
              onMouseEnter={() => setHoveredKey(section.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={cn(
                "group relative flex items-center gap-2.5 pl-2.5 pr-2 py-2 rounded-lg w-full text-left",
                "border border-transparent transition-all duration-150",
                "hover:bg-accent/50 hover:border-border/40",
                "animate-in fade-in"
              )}
              style={{ animationDelay: `${Math.min(idx * 15, 400)}ms` }}
            >
              {/* Status dot */}
              {status && (
                <span className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3 rounded-r-full transition-all", statusDot[status], isHovered ? 'h-5 opacity-100' : 'opacity-60')} />
              )}

              {/* Icon */}
              <div className={cn(
                "p-1 rounded-md transition-colors shrink-0",
                "group-hover:bg-primary/10"
              )}>
                <Icon className="h-3.5 w-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
              </div>

              {/* Label + hover tooltip */}
              <div className="flex-1 min-w-0 relative">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-foreground/90 group-hover:text-foreground truncate leading-tight">
                    {section.label.replace(/^[^\w]*\s/, '')}
                  </span>
                  {status && (
                    <span className={cn(
                      "text-[7px] font-semibold uppercase tracking-wider px-1 py-px rounded shrink-0 leading-none",
                      statusBadgeStyle[status]
                    )}>
                      {badgeText.replace(/[^\w\s]/g, '').trim().split(' ')[0] || 'Live'}
                    </span>
                  )}
                </div>

                {/* Hover description tooltip */}
                {isHovered && (
                  <div className="absolute left-0 top-full mt-1 z-30 px-2.5 py-1.5 rounded-md bg-popover border border-border/60 shadow-lg max-w-[220px] animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className={cn(
                "h-3 w-3 shrink-0 transition-all duration-150",
                isHovered ? "text-primary/70 translate-x-0.5" : "text-transparent"
              )} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StatPill: React.FC<{ icon: LucideIcon; value: number; label: string; color?: string }> = ({
  icon: Icon, value, label, color = 'text-foreground',
}) => (
  <div className="flex items-center gap-1.5">
    <Icon className={cn("h-3 w-3", color)} />
    <span className={cn("text-xs font-bold font-mono leading-none", color)}>{value}</span>
    <span className="text-[10px] text-muted-foreground/60 leading-none">{label}</span>
  </div>
);

export default CategoryOverviewDashboard;
