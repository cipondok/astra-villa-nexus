import React, { Suspense } from "react";
import { AdminCategoryTabs } from "./AdminCategoryTabs";
import SectionErrorBoundary from "./shared/SectionErrorBoundary";
import { sectionLabels, sectionRenderMap, AdminOverview } from "./adminSectionRegistry";

interface AdminDashboardContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

const LoadingFallback = () => (
  <div className="p-4 space-y-3 animate-in fade-in duration-200">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-lg bg-muted/30 border border-border/20 animate-pulse"
        />
      ))}
    </div>
    <div className="h-64 rounded-lg bg-muted/20 border border-border/20 animate-pulse" />
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

const AdminDashboardContent = ({ activeSection, onSectionChange }: AdminDashboardContentProps) => {
  const isOverview = activeSection === "overview";

  return (
    <div className="flex-1 p-3 lg:p-4">
      <div key={activeSection}>
        {!isOverview && (
          <AdminCategoryTabs
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        )}
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
