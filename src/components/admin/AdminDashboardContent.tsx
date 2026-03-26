import React, { Suspense, useMemo } from "react";
import { AdminCategoryTabs } from "./AdminCategoryTabs";
import SectionErrorBoundary from "./shared/SectionErrorBoundary";
import { sectionLabels, sectionRenderMap, AdminOverview } from "./adminSectionRegistry";

interface AdminDashboardContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
  prioritySections?: string[];
}

/* Enterprise skeleton — high density shimmer */
const LoadingFallback = () => (
  <div className="p-3 space-y-2 animate-in fade-in duration-150">
    {/* KPI strip skeleton */}
    <div className="admin-kpi-strip">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-astra bg-muted/15 border border-border/10 animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
    {/* Table skeleton */}
    <div className="space-y-1 mt-2">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-[42px] rounded-lg bg-muted/10 border border-border/8 animate-pulse"
          style={{ animationDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  </div>
);

const renderSection = (
  section: string,
  onSectionChange?: (s: string) => void,
): React.ReactNode => {
  const renderer = sectionRenderMap[section];
  if (renderer) return renderer(onSectionChange);
  return <AdminOverview onSectionChange={onSectionChange} />;
};

const AdminDashboardContent = ({
  activeSection,
  onSectionChange,
  prioritySections = [],
}: AdminDashboardContentProps) => {
  const isOverview = activeSection === "overview";

  // Priority alert banner when AI detects critical items
  const priorityBanner = useMemo(() => {
    if (prioritySections.length === 0 || !isOverview) return null;
    return (
      <div className="mx-3 mt-2 p-2 rounded-astra border border-chart-3/20 bg-chart-3/5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-chart-3 animate-pulse shrink-0" />
        <span className="text-[10px] text-foreground font-medium">
          AI Priority: {prioritySections.includes('verification') && 'Vendor verification queue needs attention'}
          {prioritySections.includes('revenue') && ' · Revenue opportunity window detected'}
          {prioritySections.includes('marketplace') && ' · Market demand spike active'}
        </span>
      </div>
    );
  }, [prioritySections, isOverview]);

  return (
    <div className="flex-1 p-2 lg:p-3">
      {priorityBanner}
      <div key={activeSection}>
        <AdminCategoryTabs
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
        <SectionErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {renderSection(activeSection, onSectionChange)}
          </Suspense>
        </SectionErrorBoundary>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
