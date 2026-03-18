import React from "react";
import SectionErrorBoundary from "../shared/SectionErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Building2, Store, Eye, Zap, Bell,
  UserCheck, AlertTriangle, CreditCard, Globe, HardDrive, Activity,
} from "lucide-react";
import MetricRow from "./MetricRow";
import ActionRow from "./ActionRow";

interface LeftStatsColumnProps {
  platformStats: {
    totalUsers: number;
    totalProperties: number;
    totalVendors: number;
    totalPageViews: number;
    activeUsers24h: number;
  } | undefined;
  statsLoading: boolean;
  sparkTrends: {
    users: number[];
    properties: number[];
    vendors: number[];
    views: number[];
    active: number[];
  } | undefined;
  statsAgo: string | null;
  pendingItems: { upgrades: number; alerts: number } | undefined;
  onQuickAction: (section: string) => void;
}

const LeftStatsColumn = React.memo(function LeftStatsColumn({
  platformStats, statsLoading, sparkTrends, statsAgo, pendingItems, onQuickAction,
}: LeftStatsColumnProps) {
  return (
    <div className="col-span-12 md:col-span-4 space-y-3">
      <SectionErrorBoundary sectionName="Platform Stats">
        {/* Key Metrics */}
        <Card className="border-border bg-card">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
              <Activity className="h-4 w-4 text-primary" /> Platform Stats
              {statsAgo && <span className="ml-auto text-[10px] font-normal text-muted-foreground">↻ {statsAgo}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <MetricRow icon={Users} label="Users" value={platformStats?.totalUsers || 0} loading={statsLoading} sparkData={sparkTrends?.users} />
            <MetricRow icon={Building2} label="Properties" value={platformStats?.totalProperties || 0} loading={statsLoading} sparkData={sparkTrends?.properties} />
            <MetricRow icon={Store} label="Vendors" value={platformStats?.totalVendors || 0} loading={statsLoading} sparkData={sparkTrends?.vendors} />
            <MetricRow icon={Eye} label="Page Views" value={platformStats?.totalPageViews || 0} loading={statsLoading} sparkData={sparkTrends?.views} />
            <MetricRow icon={Zap} label="Active (24h)" value={platformStats?.activeUsers24h || 0} highlight loading={statsLoading} sparkData={sparkTrends?.active} />
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="border-border bg-card">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
              <Bell className="h-4 w-4 text-chart-3" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1.5">
            <ActionRow icon={UserCheck} label="Upgrades" count={pendingItems?.upgrades || 0} onClick={() => onQuickAction('upgrade-applications')} urgent={!!pendingItems?.upgrades} />
            <ActionRow icon={AlertTriangle} label="Alerts" count={pendingItems?.alerts || 0} onClick={() => onQuickAction('admin-alerts')} urgent={!!pendingItems?.alerts} />
          </CardContent>
        </Card>

        {/* Quick Nav */}
        <Card className="border-border bg-card">
          <CardContent className="p-3 grid grid-cols-3 gap-2">
            {[
              { icon: Users, label: "Users", id: "user-management", key: "1" },
              { icon: Building2, label: "Props", id: "property-management-hub", key: "2" },
              { icon: Store, label: "Vendors", id: "vendors-hub", key: "3" },
              { icon: CreditCard, label: "Payments", id: "transaction-hub", key: "4" },
              { icon: Globe, label: "Analytics", id: "analytics", key: "5" },
              { icon: HardDrive, label: "System", id: "diagnostic", key: "6" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onQuickAction(item.id)}
                className="group relative flex flex-col items-center gap-1 p-2 rounded-lg border border-border hover:bg-accent/10 hover:border-primary/30 transition-all text-xs text-foreground"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
                <kbd className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded border border-border bg-muted text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.key}
                </kbd>
              </button>
            ))}
          </CardContent>
        </Card>
      </SectionErrorBoundary>
    </div>
  );
});

export default LeftStatsColumn;
