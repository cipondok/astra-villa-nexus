import React, { Suspense } from "react";
import { AdminCategoryTabs } from "./AdminCategoryTabs";
import SectionErrorBoundary from "./shared/SectionErrorBoundary";
import { sectionLabels, sectionRenderMap, AdminOverview } from "./adminSectionRegistry";

interface AdminDashboardContentProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const LoadingFallback = () => (
  <div className="p-4 md:p-6 space-y-4 animate-in fade-in duration-300">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-xl bg-muted/40 border border-border/30 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-3">
        <div className="h-8 w-1/3 rounded-lg bg-muted/40 animate-pulse" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-muted/30 border border-border/20 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded-lg bg-muted/40 animate-pulse" />
        <div className="h-48 rounded-xl bg-muted/30 border border-border/20 animate-pulse" />
        <div className="h-28 rounded-xl bg-muted/30 border border-border/20 animate-pulse" />
      </div>
    </div>
  </div>
);

// ─── Section renderer (registry-driven) ───────────────────────────────────────
const renderSection = (
  section: string,
  onSectionChange?: (s: string) => void,
): React.ReactNode => {
  const renderer = sectionRenderMap[section];
  if (renderer) return renderer(onSectionChange);
  // Fallback to overview for unknown sections
  return <AdminOverview onSectionChange={onSectionChange} />;
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDashboardContent = ({ activeSection, onSectionChange }: AdminDashboardContentProps) => {
  const isOverview = activeSection === "overview";

  return (
    <div className="flex-1 p-2 md:p-3 lg:p-4">
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
