import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { navigationSections, sectionTitles } from './navigationSections';
import {
  Search, Zap, Clock, ArrowRight, Sparkles, AlertTriangle,
  Plus, Play, BarChart3, Shield, type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminCommandPaletteProps {
  onSectionChange: (section: string) => void;
}

/* ─── Recent Commands Persistence ─── */
const RECENTS_KEY = 'admin-cmd-recents';
const MAX_RECENTS = 6;

function getRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  const recents = getRecents().filter((r) => r !== id);
  recents.unshift(id);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
}

/* ─── Quick Action Definitions ─── */
interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  keywords: string[];
  section?: string; // navigate to section
  description?: string;
}

const quickActions: QuickAction[] = [
  { id: 'qa-ai-batch', label: 'Run AI Batch Job', icon: Play, keywords: ['run', 'batch', 'ai', 'job', 'execute'], section: 'ai-command-center', description: 'Trigger AI processing pipeline' },
  { id: 'qa-add-listing', label: 'Add New Listing', icon: Plus, keywords: ['add', 'new', 'listing', 'property', 'create'], section: 'property-management-hub', description: 'Create a new property listing' },
  { id: 'qa-view-alerts', label: 'View System Alerts', icon: AlertTriangle, keywords: ['alerts', 'warnings', 'notifications', 'urgent'], section: 'admin-alerts', description: 'Check critical system alerts' },
  { id: 'qa-analytics', label: 'View Analytics', icon: BarChart3, keywords: ['analytics', 'stats', 'metrics', 'performance'], section: 'analytics', description: 'Platform analytics overview' },
  { id: 'qa-security', label: 'Security Monitor', icon: Shield, keywords: ['security', 'monitor', 'threats', 'audit'], section: 'security-monitoring', description: 'Real-time security status' },
  { id: 'qa-seo', label: 'SEO Dashboard', icon: Sparkles, keywords: ['seo', 'search', 'optimization', 'content'], section: 'seo-hub', description: 'SEO performance & tools' },
];

/* ─── Flatten all navigation sections into searchable items ─── */
interface FlatItem {
  id: string;
  label: string;
  icon: LucideIcon;
  category: string;
  description?: string;
  badge?: string;
  keywords: string[];
}

function buildIndex(): FlatItem[] {
  const items: FlatItem[] = [];
  for (const [category, sections] of Object.entries(navigationSections)) {
    const catTitle = sectionTitles[category as keyof typeof sectionTitles] || category;
    for (const section of sections) {
      items.push({
        id: section.key,
        label: section.label,
        icon: section.icon,
        category: catTitle,
        description: section.description,
        badge: (section as any).badge,
        keywords: [
          section.label.toLowerCase(),
          section.key.replace(/-/g, ' '),
          catTitle.toLowerCase(),
          section.description?.toLowerCase() || '',
        ],
      });
    }
  }
  return items;
}

export function AdminCommandPalette({ onSectionChange }: AdminCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Precomputed index — stable across renders
  const allItems = useMemo(() => buildIndex(), []);

  // Recent items
  const [recentIds, setRecentIds] = useState<string[]>(getRecents);

  const recentItems = useMemo(
    () => recentIds.map((id) => allItems.find((item) => item.id === id)).filter(Boolean) as FlatItem[],
    [recentIds, allItems]
  );

  // ─── Keyboard trigger ───
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // ─── Focus management ───
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      // Restore focus on close
      setTimeout(() => previousFocusRef.current?.focus(), 0);
      setSearch('');
    }
  }, [open]);

  const handleSelect = useCallback(
    (id: string, sectionOverride?: string) => {
      const target = sectionOverride || id;
      pushRecent(target);
      setRecentIds(getRecents());
      onSectionChange(target);
      setOpen(false);
    },
    [onSectionChange]
  );

  const hasSearch = search.trim().length > 0;

  // Group items by category for display when not searching
  const groupedItems = useMemo(() => {
    const groups: Record<string, FlatItem[]> = {};
    // Show top 6 most useful sections when no search
    const prioritySections = ['overview', 'property-management-hub', 'user-management', 'analytics', 'ai-command-center', 'admin-alerts', 'seo-hub', 'security-monitoring'];
    const priorityItems = prioritySections
      .map((id) => allItems.find((item) => item.id === id))
      .filter(Boolean) as FlatItem[];

    for (const item of priorityItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [allItems]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-2 px-3 py-1.5 rounded-xl
          bg-muted/40 hover:bg-muted/70 transition-all duration-200
          border border-border/40 hover:border-border/60
          text-sm text-muted-foreground hover:text-foreground
          h-9 group
        "
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline text-xs">Search commands...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded-md border border-border/50 bg-background/80 px-1.5 text-[10px] font-mono font-medium text-muted-foreground ml-1 group-hover:border-primary/30 group-hover:text-primary transition-colors">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="overflow-hidden p-0 max-w-[560px] rounded-2xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70"
            shouldFilter={true}
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-border/30 px-4">
              <Search className="mr-2.5 h-4 w-4 shrink-0 text-primary/60" />
              <CommandInput
                placeholder="Search sections, actions, tools..."
                className="h-12 text-sm border-0 ring-0 focus:ring-0 placeholder:text-muted-foreground/50"
                value={search}
                onValueChange={setSearch}
              />
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/40 bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground/60 ml-2 flex-shrink-0">
                ESC
              </kbd>
            </div>

            <CommandList className="max-h-[420px] overflow-y-auto p-1">
              <CommandEmpty className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground/60">Try different keywords or browse sections</p>
                </div>
              </CommandEmpty>

              {/* Recent — show only when not searching */}
              {!hasSearch && recentItems.length > 0 && (
                <>
                  <CommandGroup heading="Recent">
                    {recentItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <CommandItem
                          key={`recent-${item.id}`}
                          value={`recent-${item.id}`}
                          onSelect={() => handleSelect(item.id)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                          keywords={item.keywords}
                        >
                          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandSeparator className="my-1 bg-border/20" />
                </>
              )}

              {/* Quick Actions */}
              {!hasSearch && (
                <>
                  <CommandGroup heading="Quick Actions">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <CommandItem
                          key={action.id}
                          value={action.id}
                          onSelect={() => handleSelect(action.id, action.section)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                          keywords={action.keywords}
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{action.label}</span>
                            {action.description && (
                              <p className="text-[11px] text-muted-foreground/60 truncate">{action.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md border-primary/20 text-primary/70 font-normal flex-shrink-0">
                            <Zap className="h-2.5 w-2.5 mr-0.5" />
                            Action
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandSeparator className="my-1 bg-border/20" />
                </>
              )}

              {/* Navigation Sections — when searching, cmdk filters; when not, show priority */}
              {hasSearch ? (
                // All sections — cmdk handles filtering via `value` and `keywords`
                Object.entries(navigationSections).map(([category, sections]) => {
                  const catTitle = sectionTitles[category as keyof typeof sectionTitles] || category;
                  return (
                    <CommandGroup key={category} heading={catTitle}>
                      {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <CommandItem
                            key={section.key}
                            value={section.key}
                            onSelect={() => handleSelect(section.key)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                            keywords={[
                              section.label.toLowerCase(),
                              section.key.replace(/-/g, ' '),
                              catTitle.toLowerCase(),
                              section.description?.toLowerCase() || '',
                            ]}
                          >
                            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{section.label}</span>
                              {section.description && (
                                <p className="text-[11px] text-muted-foreground/60 truncate">{section.description}</p>
                              )}
                            </div>
                            {section.badge && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-md flex-shrink-0">
                                {section.badge}
                              </Badge>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                })
              ) : (
                // Priority sections grouped
                Object.entries(groupedItems).map(([category, items]) => (
                  <CommandGroup key={category} heading={category}>
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => handleSelect(item.id)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                          keywords={item.keywords}
                        >
                          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground/60 truncate">{item.description}</p>
                            )}
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-md flex-shrink-0">
                              {item.badge}
                            </Badge>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))
              )}

              {/* Quick Actions in search mode too */}
              {hasSearch && (
                <CommandGroup heading="Quick Actions">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <CommandItem
                        key={action.id}
                        value={action.id}
                        onSelect={() => handleSelect(action.id, action.section)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                        keywords={action.keywords}
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{action.label}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md border-primary/20 text-primary/70 font-normal flex-shrink-0">
                          <Zap className="h-2.5 w-2.5 mr-0.5" />
                          Action
                        </Badge>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/20 px-4 py-2.5 bg-muted/20">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                <span className="flex items-center gap-1">
                  <kbd className="h-4 min-w-[16px] rounded border border-border/40 bg-background/80 px-1 text-[10px] font-mono inline-flex items-center justify-center">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="h-4 min-w-[16px] rounded border border-border/40 bg-background/80 px-1 text-[10px] font-mono inline-flex items-center justify-center">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="h-4 min-w-[16px] rounded border border-border/40 bg-background/80 px-1 text-[10px] font-mono inline-flex items-center justify-center">esc</kbd>
                  Close
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/40 font-medium">ASTRAVILLA</span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
