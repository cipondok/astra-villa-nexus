import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { navigationSections, sectionTitles, categories } from './navigationSections';

interface AdminBreadcrumbProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminBreadcrumb({ activeSection, onSectionChange }: AdminBreadcrumbProps) {
  // Find the category and section info
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

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <button
        onClick={() => onSectionChange('overview')}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </button>
      
      {categoryName && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="hidden md:inline">{categoryName}</span>
        </>
      )}
      
      {sectionInfo && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{sectionInfo.label}</span>
        </>
      )}
    </nav>
  );
}
