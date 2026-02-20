import React, { useMemo, useCallback } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { navigationSections, sectionTitles, categories } from './navigationSections';

interface AdminBreadcrumbProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const AdminBreadcrumb = React.memo(function AdminBreadcrumb({ activeSection, onSectionChange }: AdminBreadcrumbProps) {
  // Memoize expensive category/section lookup
  const { categoryName, sectionInfo } = useMemo(() => {
    let categoryName = '';
    let sectionInfo = null;
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      const found = sections?.find((s) => s.key === activeSection);
      if (found) {
        categoryName = sectionTitles[category as keyof typeof sectionTitles];
        sectionInfo = found;
        break;
      }
    }
    return { categoryName, sectionInfo };
  }, [activeSection]);

  const goToOverview = useCallback(() => onSectionChange('overview'), [onSectionChange]);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button
        onClick={goToOverview}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Admin</span>
      </button>
      
      {categoryName && (
        <>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="hidden md:inline text-muted-foreground/80">{categoryName}</span>
        </>
      )}
      
      {sectionInfo && (
        <>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{sectionInfo.label}</span>
        </>
      )}
    </nav>
  );
});

