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
  Plus, Play, BarChart3, Shield, Building, Users, FileText,
  Loader2, TrendingUp, Globe,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGlobalIntelligenceSearch } from '@/hooks/useGlobalIntelligenceSearch';
import { useDebounce } from '@/hooks/useDebounce';

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
  section?: string;
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

/* ─── Flatten navigation sections ─── */
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

/* ─── Helpers ─── */
function formatPrice(price: number): string {
  if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(1)}B`;
  if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'text-destructive border-destructive/30';
    case 'high': return 'text-orange-500 border-orange-500/30';
    case 'medium': return 'text-yellow-500 border-yellow-500/30';
    default: return 'text-muted-foreground border-border/40';
  }
}

/* ─── Component ─── */
export function AdminCommandPalette({ onSectionChange }: AdminCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<any | null>(null);

  const allItems = useMemo(() => buildIndex(), []);
  const [recentIds, setRecentIds] = useState<string[]>(getRecents);
  const recentItems = useMemo(
    () => recentIds.map((id) => allItems.find((item) => item.id === id)).filter(Boolean) as FlatItem[],
    [recentIds, allItems]
  );

  // ─── Global Intelligence Search ───
  const { results: liveResults, isSearching, totalResults, search: doSearch, clearResults } = useGlobalIntelligenceSearch();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      doSearch(debouncedSearch);
    } else {
      clearResults();
    }
  }, [debouncedSearch, doSearch, clearResults]);

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
      setTimeout(() => previousFocusRef.current?.focus(), 0);
      setSearch('');
      setSelectedPreview(null);
      clearResults();
    }
  }, [open, clearResults]);

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
  const hasLiveResults = totalResults > 0;

  // Priority sections for default view
  const groupedItems = useMemo(() => {
    const groups: Record<string, FlatItem[]> = {};
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
        <span className="hidden md:inline text-xs">Search everything...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded-md border border-border/50 bg-background/80 px-1.5 text-[10px] font-mono font-medium text-muted-foreground ml-1 group-hover:border-primary/30 group-hover:text-primary transition-colors">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="overflow-hidden p-0 max-w-[640px] rounded-2xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70"
            shouldFilter={!hasLiveResults}
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-border/30 px-4">
              {isSearching ? (
                <Loader2 className="mr-2.5 h-4 w-4 shrink-0 text-primary animate-spin" />
              ) : (
                <Search className="mr-2.5 h-4 w-4 shrink-0 text-primary/60" />
              )}
              <CommandInput
                placeholder="Search properties, leads, alerts, SEO pages..."
                className="h-12 text-sm border-0 ring-0 focus:ring-0 placeholder:text-muted-foreground/50"
                value={search}
                onValueChange={setSearch}
              />
              {hasSearch && totalResults > 0 && (
                <span className="text-[10px] text-muted-foreground/50 font-mono whitespace-nowrap mr-2">
                  {totalResults} found
                </span>
              )}
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/40 bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground/60 ml-2 flex-shrink-0">
                ESC
              </kbd>
            </div>

            <div className="flex">
              {/* Main Results */}
              <CommandList className={`max-h-[460px] overflow-y-auto p-1 ${selectedPreview ? 'w-[55%]' : 'w-full'} transition-all duration-200`}>
                <CommandEmpty className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground/60">Try different keywords</p>
                  </div>
                </CommandEmpty>

                {/* ─── LIVE DATA RESULTS ─── */}
                {hasSearch && hasLiveResults && (
                  <>
                    {/* Properties */}
                    {liveResults.properties.length > 0 && (
                      <CommandGroup heading={`Properties · ${liveResults.properties.length}`}>
                        {liveResults.properties.map((p) => (
                          <CommandItem
                            key={`prop-${p.id}`}
                            value={`prop-${p.id}-${p.title}`}
                            onSelect={() => handleSelect('property-management-hub')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                            onMouseEnter={() => setSelectedPreview({ ...p, _type: 'property' })}
                          >
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <Building className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">{p.title}</span>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                                <span>{p.city}</span>
                                <span>·</span>
                                <span>{formatPrice(p.price)}</span>
                              </div>
                            </div>
                            {p.deal_score && p.deal_score >= 70 && (
                              <Badge className="text-[10px] px-1.5 py-0 rounded-md bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono flex-shrink-0">
                                {p.deal_score}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Alerts */}
                    {liveResults.alerts.length > 0 && (
                      <>
                        <CommandSeparator className="my-1 bg-border/20" />
                        <CommandGroup heading={`Alerts · ${liveResults.alerts.length}`}>
                          {liveResults.alerts.map((a) => (
                            <CommandItem
                              key={`alert-${a.id}`}
                              value={`alert-${a.id}-${a.title}`}
                              onSelect={() => handleSelect('admin-alerts')}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                              onMouseEnter={() => setSelectedPreview({ ...a, _type: 'alert' })}
                            >
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.priority === 'critical' ? 'bg-destructive/10' : a.priority === 'high' ? 'bg-orange-500/10' : 'bg-muted/50'}`}>
                                <AlertTriangle className={`h-3.5 w-3.5 ${a.priority === 'critical' ? 'text-destructive' : a.priority === 'high' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{a.title}</span>
                                <span className="text-[11px] text-muted-foreground/60">{timeAgo(a.created_at)}</span>
                              </div>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-md font-normal flex-shrink-0 ${priorityColor(a.priority)}`}>
                                {a.priority}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}

                    {/* Leads */}
                    {liveResults.leads.length > 0 && (
                      <>
                        <CommandSeparator className="my-1 bg-border/20" />
                        <CommandGroup heading={`Leads · ${liveResults.leads.length}`}>
                          {liveResults.leads.map((l) => (
                            <CommandItem
                              key={`lead-${l.id}`}
                              value={`lead-${l.id}-${l.agent_name}`}
                              onSelect={() => handleSelect('agent-pipeline')}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                              onMouseEnter={() => setSelectedPreview({ ...l, _type: 'lead' })}
                            >
                              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <Users className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{l.agent_name}</span>
                                <span className="text-[11px] text-muted-foreground/60">{l.city} · {l.stage}</span>
                              </div>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-md font-normal flex-shrink-0 ${priorityColor(l.priority)}`}>
                                {l.priority}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}

                    {/* SEO Pages */}
                    {liveResults.seo_pages.length > 0 && (
                      <>
                        <CommandSeparator className="my-1 bg-border/20" />
                        <CommandGroup heading={`SEO Pages · ${liveResults.seo_pages.length}`}>
                          {liveResults.seo_pages.map((s) => (
                            <CommandItem
                              key={`seo-${s.id}`}
                              value={`seo-${s.id}-${s.title}`}
                              onSelect={() => handleSelect('seo-hub')}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-1 aria-selected:bg-primary/10 aria-selected:text-primary"
                              onMouseEnter={() => setSelectedPreview({ ...s, _type: 'seo_page' })}
                            >
                              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                <Globe className="h-3.5 w-3.5 text-violet-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{s.title}</span>
                                <span className="text-[11px] text-muted-foreground/60">{s.primary_keyword}</span>
                              </div>
                              {s.seo_score && (
                                <Badge className={`text-[10px] px-1.5 py-0 rounded-md font-mono flex-shrink-0 ${s.seo_score >= 80 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted/50 text-muted-foreground border-border/40'}`}>
                                  {s.seo_score}
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}

                    <CommandSeparator className="my-1 bg-border/20" />
                  </>
                )}

                {/* ─── NAVIGATION & ACTIONS (always available) ─── */}

                {/* Recent — only when not searching */}
                {!hasSearch && recentItems.length > 0 && (
                  <>
                    <CommandGroup heading="Recent">
                      {recentItems.map((item) => (
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
                      ))}
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

                {/* Navigation Sections */}
                {hasSearch ? (
                  <CommandGroup heading="Sections">
                    {allItems.map((item) => {
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
                ) : (
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

                {/* Quick Actions in search mode */}
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

              {/* ─── PREVIEW PANEL ─── */}
              {selectedPreview && hasSearch && (
                <div className="w-[45%] border-l border-border/20 p-4 max-h-[460px] overflow-y-auto bg-muted/10 animate-in slide-in-from-right-2 duration-150">
                  <PreviewPanel data={selectedPreview} />
                </div>
              )}
            </div>

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
              <div className="flex items-center gap-2">
                {isSearching && (
                  <span className="text-[10px] text-primary/60 flex items-center gap-1">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Searching...
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/40 font-medium">ASTRAVILLA</span>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Preview Panel ─── */
function PreviewPanel({ data }: { data: any }) {
  if (data._type === 'property') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-emerald-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Property</span>
        </div>
        <h3 className="text-sm font-semibold leading-snug">{data.title}</h3>
        <div className="space-y-2">
          <DetailRow label="Location" value={`${data.city}, ${data.state}`} />
          <DetailRow label="Price" value={formatPrice(data.price)} highlight />
          <DetailRow label="Type" value={`${data.property_type} · ${data.listing_type}`} />
          {data.deal_score != null && (
            <DetailRow label="Deal Score" value={`${data.deal_score}/100`} highlight={data.deal_score >= 70} />
          )}
          {data.demand_score != null && (
            <DetailRow label="Demand" value={`${data.demand_score}/100`} />
          )}
          <DetailRow label="Status" value={data.status} />
          <DetailRow label="Listed" value={timeAgo(data.created_at)} />
        </div>
      </div>
    );
  }

  if (data._type === 'alert') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${data.priority === 'critical' ? 'text-destructive' : 'text-orange-500'}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Alert</span>
        </div>
        <h3 className="text-sm font-semibold leading-snug">{data.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{data.message}</p>
        <div className="space-y-2">
          <DetailRow label="Priority" value={data.priority} highlight={data.priority === 'critical'} />
          <DetailRow label="Type" value={data.type} />
          <DetailRow label="Action Required" value={data.action_required ? 'Yes' : 'No'} highlight={data.action_required} />
          <DetailRow label="Status" value={data.is_read ? 'Read' : 'Unread'} />
          <DetailRow label="Time" value={timeAgo(data.created_at)} />
        </div>
      </div>
    );
  }

  if (data._type === 'lead') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Lead</span>
        </div>
        <h3 className="text-sm font-semibold leading-snug">{data.agent_name}</h3>
        <div className="space-y-2">
          <DetailRow label="City" value={data.city} />
          <DetailRow label="Stage" value={data.stage} />
          <DetailRow label="Priority" value={data.priority} highlight={data.priority === 'critical' || data.priority === 'high'} />
          <DetailRow label="Source" value={data.source_channel} />
          {data.specialization && <DetailRow label="Specialization" value={data.specialization} />}
          {data.email && <DetailRow label="Email" value={data.email} />}
          <DetailRow label="Added" value={timeAgo(data.created_at)} />
        </div>
      </div>
    );
  }

  if (data._type === 'seo_page') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-violet-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">SEO Page</span>
        </div>
        <h3 className="text-sm font-semibold leading-snug">{data.title}</h3>
        <div className="space-y-2">
          <DetailRow label="Keyword" value={data.primary_keyword} />
          {data.seo_score != null && (
            <DetailRow label="SEO Score" value={`${data.seo_score}/100`} highlight={data.seo_score >= 80} />
          )}
          {data.organic_traffic != null && (
            <DetailRow label="Traffic" value={data.organic_traffic.toLocaleString()} />
          )}
          <DetailRow label="Type" value={data.content_type} />
          <DetailRow label="Status" value={data.status} />
          {data.target_location && <DetailRow label="Location" value={data.target_location} />}
          <DetailRow label="Created" value={timeAgo(data.created_at)} />
        </div>
      </div>
    );
  }

  return null;
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/10 last:border-0">
      <span className="text-[11px] text-muted-foreground/60">{label}</span>
      <span className={`text-[11px] font-medium ${highlight ? 'text-primary' : 'text-foreground/80'}`}>{value}</span>
    </div>
  );
}
