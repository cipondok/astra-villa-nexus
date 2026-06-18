import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart, CalendarCheck, Calculator, Coins, Share2, BarChart3,
  Users, Building2, Wallet, ClipboardList, Wrench, Briefcase,
  PiggyBank, LineChart, GitBranch, LifeBuoy, ShieldCheck, Flag,
  ChevronRight, Home,
} from 'lucide-react';
import type { UserRole } from '@/hooks/useUserRoles';
import { getRoleWidgets, DashboardWidgetId } from '@/lib/dashboardRoute';

type WidgetMeta = {
  id: DashboardWidgetId;
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const REGISTRY: Record<DashboardWidgetId, WidgetMeta> = {
  saved:         { id: 'saved',         title: 'Saved Properties',     description: 'Your shortlist & alerts',          to: '/favorites',                 icon: Heart,         accent: 'text-rose-400' },
  visits:        { id: 'visits',        title: 'Property Visits',      description: 'Upcoming tours & follow-ups',      to: '/dashboard?tab=visits',      icon: CalendarCheck, accent: 'text-sky-400' },
  mortgage:      { id: 'mortgage',      title: 'Mortgage Center',      description: 'KPR scenarios & applications',     to: '/mortgage',                  icon: Calculator,    accent: 'text-emerald-400' },
  astra:         { id: 'astra',         title: 'ASTRA Wallet',         description: 'Tokens, rewards & cashback',       to: '/astra-tokens',              icon: Coins,         accent: 'text-amber-400' },
  referrals:     { id: 'referrals',     title: 'Referrals',            description: 'Invite & earn commissions',        to: '/referrals',                 icon: Share2,        accent: 'text-fuchsia-400' },
  market:        { id: 'market',        title: 'Market Intelligence',  description: 'Heatmap, trends & demand',         to: '/market-heatmap',            icon: BarChart3,     accent: 'text-cyan-400' },
  leads:         { id: 'leads',         title: 'Leads',                description: 'CRM pipeline & inquiries',         to: '/agent-dashboard?tab=leads', icon: Users,         accent: 'text-indigo-400' },
  listings:      { id: 'listings',      title: 'My Listings',          description: 'Active, drafts & performance',     to: '/my-properties',             icon: Building2,     accent: 'text-amber-300' },
  commissions:   { id: 'commissions',   title: 'Commissions',          description: 'Earnings & payouts',               to: '/wallet',                    icon: Wallet,        accent: 'text-emerald-400' },
  bookings:      { id: 'bookings',      title: 'Bookings',             description: 'Reservations & check-ins',         to: '/dashboard?tab=bookings',    icon: ClipboardList, accent: 'text-sky-400' },
  services:      { id: 'services',      title: 'Service Orders',       description: 'Quotes, jobs & ratings',           to: '/vendor-marketplace',        icon: Wrench,        accent: 'text-orange-400' },
  portfolio:     { id: 'portfolio',     title: 'Portfolio',            description: 'Holdings & allocation',            to: '/portfolio-dashboard',       icon: Briefcase,     accent: 'text-amber-400' },
  rentIncome:    { id: 'rentIncome',    title: 'Rental Income',        description: 'Monthly cashflow & invoices',      to: '/dashboard/property-owner',  icon: PiggyBank,     accent: 'text-emerald-400' },
  tenants:       { id: 'tenants',       title: 'Tenants',              description: 'Leases, requests & renewals',      to: '/dashboard/property-owner',  icon: Users,         accent: 'text-indigo-400' },
  fundPositions: { id: 'fundPositions', title: 'Fund Positions',       description: 'REIT & fractional units',          to: '/investor-dashboard',        icon: LineChart,     accent: 'text-cyan-400' },
  roiForecast:   { id: 'roiForecast',   title: 'ROI Forecast',         description: 'Projected yield & scenarios',      to: '/investment',                icon: LineChart,     accent: 'text-emerald-400' },
  pipeline:      { id: 'pipeline',      title: 'Deal Pipeline',        description: 'Negotiations & escrow',            to: '/agent-dashboard?tab=deals', icon: GitBranch,     accent: 'text-amber-300' },
  support:       { id: 'support',       title: 'Support Queue',        description: 'Open tickets & SLAs',              to: '/admin/support-dashboard',   icon: LifeBuoy,      accent: 'text-sky-400' },
  systemHealth:  { id: 'systemHealth',  title: 'System Health',        description: 'Platform metrics & alerts',        to: '/admin-dashboard',           icon: ShieldCheck,   accent: 'text-emerald-400' },
  moderation:    { id: 'moderation',    title: 'Moderation',           description: 'Reports, KYC & fraud signals',     to: '/admin/listing-review',      icon: Flag,          accent: 'text-rose-400' },
};

interface Props {
  roles: UserRole[];
}

const RoleDashboardWidgets = ({ roles }: Props) => {
  const navigate = useNavigate();
  const widgetIds = useMemo(() => getRoleWidgets(roles), [roles]);
  const widgets = widgetIds.map((id) => REGISTRY[id]).filter(Boolean);

  const primaryRole = roles.find((r) => r !== 'general_user') || roles[0] || 'general_user';
  const roleLabel = primaryRole
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <section aria-labelledby="role-widgets-heading" className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Home className="h-3.5 w-3.5 text-gold-primary" />
          <h2 id="role-widgets-heading" className="text-xs sm:text-sm font-semibold tracking-tight">
            For You
          </h2>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-gold-primary/30 text-gold-primary">
            {roleLabel}
          </Badge>
        </div>
        <span className="text-[9px] text-muted-foreground">{widgets.length} widgets</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
        {widgets.map((w, idx) => (
          <motion.button
            key={w.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => navigate(w.to)}
            className="text-left focus:outline-none focus:ring-2 focus:ring-gold-primary/40 rounded-xl"
            aria-label={`${w.title} – ${w.description}`}
          >
            <Card className="h-full bg-card/60 border-gold-primary/15 hover:border-gold-primary/40 hover:shadow-sm transition-all group">
              <CardContent className="p-2.5 sm:p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`h-7 w-7 rounded-md bg-gold-primary/10 flex items-center justify-center ${w.accent}`}>
                    <w.icon className="h-3.5 w-3.5" />
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-2">
                  <p className="text-[11px] sm:text-xs font-semibold leading-tight">{w.title}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                    {w.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default RoleDashboardWidgets;
