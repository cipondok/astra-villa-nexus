import React from 'react';
import { navigationSections, sectionTitles, type NavigationSection } from './navigationSections';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Building2, Wrench, Settings, Cpu, Coins,
  Headphones, ShoppingBag, BarChart3, DollarSign, Globe, Palette, Sparkles,
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

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <CategoryIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-2">
            {sections.length} module{sections.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Section Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.key}
              onClick={() => onSectionChange?.(section.key)}
              className={cn(
                "bg-card/80 backdrop-blur border-border/40 cursor-pointer transition-all duration-200",
                "hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 group",
                "animate-in fade-in slide-in-from-bottom-1"
              )}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{section.label}</h3>
                      {'badge' in section && section.badge && (
                        <Badge variant="secondary" className="text-[8px] h-4 px-1.5 shrink-0">
                          {String(section.badge)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryOverviewDashboard;
