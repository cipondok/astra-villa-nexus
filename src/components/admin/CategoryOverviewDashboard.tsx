import React, { useMemo } from 'react';
import { navigationSections, sectionTitles, type NavigationSection } from './navigationSections';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Building2, Wrench, Settings, Cpu, Coins,
  Headphones, ShoppingBag, BarChart3, DollarSign, Globe, Palette, Sparkles,
  ArrowRight, TrendingUp, Zap, Layers, CheckCircle2, Clock, AlertCircle,
  type LucideIcon,
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard,
  "investor-management": Globe,
  "transactions": DollarSign,
  "astra-token": Coins,
  "tools": Wrench,
  "core-management": Building2,
  "customer-service": Headphones,
  "user-management": Users,
  "vendor-management": ShoppingBag,
  "analytics-monitoring": BarChart3,
  "content-settings": Palette,
  "system-settings": Settings,
  "technical": Cpu,
  "features": Sparkles,
  "help": LayoutDashboard,
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

// Badge → status category mapping
const badgeStatusMap: Record<string, 'active' | 'new' | 'hot' | 'premium'> = {
  'New': 'new',
  '🔥 Hot': 'hot',
  'Premium': 'premium',
  '🚀 Launch': 'active',
  '📈 Growth': 'active',
  '🎯 Agents': 'active',
  '📦 Supply': 'active',
  '📈 Investors': 'active',
  '🎬 Content': 'active',
  '🤝 Partnerships': 'active',
  '👑 Authority': 'active',
  '💰 Revenue': 'active',
  '🎯 Fundraising': 'active',
  '🏘️ Community': 'active',
  '🗺️ National': 'active',
  '👤 Personal Brand': 'active',
  '👥 Team': 'active',
  '🤝 Hiring': 'active',
  '📈 Growth Hire': 'active',
  '🏗️ Supply Hire': 'active',
  '💚 Success Hire': 'active',
  '🏛️ Org Design': 'active',
  '💰 Budget Plan': 'active',
  '🚀 Fundraise': 'active',
  '⏱️ Routine': 'active',
  '📰 PR Plan': 'active',
  '📧 Outreach': 'active',
  '⚡ Daily': 'active',
  '🔥 30-Day Sprint': 'hot',
  '🎯 90-Day Plan': 'active',
  '🎨 Design System': 'active',
  '🏠 Homepage': 'active',
  '🔍 Audit': 'active',
};

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  new: 'bg-primary/10 text-primary border-primary/20',
  hot: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  premium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
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

  // Filter out the overview item
  const contentSections = sections.filter(s => !s.key.endsWith('-overview'));

  // Analytics for features category
  const analytics = useMemo(() => {
    if (!isFeatures) return null;
    const badges = contentSections.map(s => ('badge' in s ? String(s.badge || '') : ''));
    const newCount = badges.filter(b => b === 'New').length;
    const hotCount = badges.filter(b => b.includes('🔥')).length;
    const premiumCount = badges.filter(b => b === 'Premium').length;
    const activeCount = contentSections.length - newCount;
    return { total: contentSections.length, newCount, hotCount, premiumCount, activeCount };
  }, [isFeatures, contentSections]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/[0.03] p-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <CategoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">{description}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-border/60 shrink-0">
            {contentSections.length} modules
          </Badge>
        </div>

        {/* Feature Analytics Strip */}
        {isFeatures && analytics && (
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/30">
            <AnalyticChip icon={Layers} label="Total Modules" value={analytics.total} color="text-primary" />
            <AnalyticChip icon={Zap} label="Active" value={analytics.activeCount} color="text-emerald-500" />
            <AnalyticChip icon={TrendingUp} label="Hot Priority" value={analytics.hotCount} color="text-orange-500" />
            <AnalyticChip icon={Sparkles} label="New" value={analytics.newCount} color="text-primary" />
          </div>
        )}
      </div>

      {/* Slim Section Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {contentSections.map((section, idx) => {
          const Icon = section.icon;
          const badgeText = 'badge' in section ? String(section.badge || '') : '';
          const status = badgeStatusMap[badgeText] || (badgeText ? 'active' : undefined);

          return (
            <button
              key={section.key}
              onClick={() => onSectionChange?.(section.key)}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/30 bg-card/60",
                "text-left transition-all duration-200 w-full",
                "hover:bg-primary/[0.04] hover:border-primary/25 hover:shadow-sm",
                "animate-in fade-in slide-in-from-bottom-1"
              )}
              style={{ animationDelay: `${idx * 20}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "p-1.5 rounded-md border transition-colors shrink-0",
                "bg-muted/40 border-border/30",
                "group-hover:bg-primary/10 group-hover:border-primary/20"
              )}>
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {section.label.replace(/^[^\w]*\s/, '')}
                  </span>
                  {status && (
                    <span className={cn(
                      "inline-flex items-center text-[8px] font-medium px-1.5 py-0.5 rounded-full border leading-none shrink-0",
                      statusColors[status]
                    )}>
                      {badgeText.replace(/[^\w\s]/g, '').trim() || 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-snug">
                  {section.description}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Small analytics chip component
const AnalyticChip: React.FC<{
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2.5">
    <div className="p-1.5 rounded-md bg-muted/50 border border-border/30">
      <Icon className={cn("h-3.5 w-3.5", color)} />
    </div>
    <div>
      <p className="text-sm font-bold text-foreground font-mono leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{label}</p>
    </div>
  </div>
);

export default CategoryOverviewDashboard;
