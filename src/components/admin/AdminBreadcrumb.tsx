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
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button
        onClick={() => onSectionChange('overview')}
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
}
