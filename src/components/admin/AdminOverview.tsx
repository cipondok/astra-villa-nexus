import React, { useCallback } from "react";
import { useAdminOverviewData } from "@/hooks/useAdminOverviewData";
import OverviewHeader from "./overview/OverviewHeader";
import LeftStatsColumn from "./overview/LeftStatsColumn";
import CenterActivityColumn from "./overview/CenterActivityColumn";
import RightIntelligenceColumn from "./overview/RightIntelligenceColumn";

interface AdminOverviewProps {
  onSectionChange?: (section: string) => void;
}

const AdminOverview = React.memo(function AdminOverview({ onSectionChange }: AdminOverviewProps) {
  const handleQuickAction = useCallback((section: string) => {
    onSectionChange?.(section);
  }, [onSectionChange]);

  const {
    sparkTrends,
    platformStats,
    statsLoading,
    refetchStats,
    systemHealth,
    recentActivity,
    pendingItems,
    hourlyTraffic,
    maxTraffic,
    aiData,
    aiLoading,
    statsAgo,
    healthAgo,
    activityAgo,
    trafficAgo,
    aiAgo,
  } = useAdminOverviewData();

  return (
    <section aria-label="Admin overview dashboard" className="space-y-3 animate-in fade-in duration-300">
      <OverviewHeader onRefresh={() => refetchStats()} />

      <div className="grid grid-cols-12 gap-3">
        <LeftStatsColumn
          platformStats={platformStats}
          statsLoading={statsLoading}
          sparkTrends={sparkTrends}
          statsAgo={statsAgo}
          pendingItems={pendingItems}
          onQuickAction={handleQuickAction}
        />

        <CenterActivityColumn
          hourlyTraffic={hourlyTraffic}
          maxTraffic={maxTraffic}
          trafficAgo={trafficAgo}
          recentActivity={recentActivity}
          activityAgo={activityAgo}
          platformStats={platformStats}
          systemHealth={systemHealth}
          onQuickAction={handleQuickAction}
        />

        <RightIntelligenceColumn
          systemHealth={systemHealth}
          healthAgo={healthAgo}
          aiData={aiData}
          aiLoading={aiLoading}
          aiAgo={aiAgo}
          onQuickAction={handleQuickAction}
        />
      </div>
    </section>
  );
});

export default AdminOverview;
