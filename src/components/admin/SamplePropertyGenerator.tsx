import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { suppressSessionCheck } from "@/hooks/useSessionMonitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Sparkles, MapPin, Loader2, CheckCircle, AlertTriangle, ImageIcon, StopCircle, ChevronsUpDown, Check, Play, Pause, RotateCcw, Zap, ChevronDown, ChevronUp, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'land', 'commercial', 'townhouse', 'warehouse', 'kost'];

const AUTO_RUN_STORAGE_KEY = 'spg_auto_run_state';

interface AutoRunState {
  isAutoMode: boolean;
  completedProvinces: string[];
  currentProvince: string;
  currentOffset: number;
  totalCreated: number;
  totalSkipped: number;
  totalErrors: number;
  provincesQueue: string[];
  startedAt: number;
  lastUpdated: number;
}

const loadAutoRunState = (): AutoRunState | null => {
  try {
    const stored = localStorage.getItem(AUTO_RUN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const saveAutoRunState = (state: AutoRunState) => {
  try { localStorage.setItem(AUTO_RUN_STORAGE_KEY, JSON.stringify(state)); } catch {}
};

const clearAutoRunState = () => {
  try { localStorage.removeItem(AUTO_RUN_STORAGE_KEY); } catch {}
};

const SamplePropertyGenerator = () => {
  const queryClient = useQueryClient();
  const [selectedProvince, setSelectedProvince] = useState(() => localStorage.getItem('spg_last_province') || "");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ created: 0, skipped: 0, errors: 0, processed: 0, total: 0 });
  const [result, setResult] = useState<any>(null);
  const cancelRef = useRef(false);

  // Auto-run state
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunState, setAutoRunState] = useState<AutoRunState | null>(() => loadAutoRunState());
  const [autoCurrentProvince, setAutoCurrentProvince] = useState("");
  const [autoProvinceIndex, setAutoProvinceIndex] = useState(0);
  const [autoTotalProvinces, setAutoTotalProvinces] = useState(0);
  const autoRunningRef = useRef(false);

  // Smart selection
  const [showProvinceList, setShowProvinceList] = useState(false);
  const [smartSelectedProvinces, setSmartSelectedProvinces] = useState<string[]>([]);

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    localStorage.setItem('spg_last_province', province);
    setProvinceOpen(false);
  };

  const { data: provinces = [], isLoading: loadingProvinces } = useQuery({
    queryKey: ["provinces-for-seeding"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_distinct_provinces");
      if (error) throw error;
      return ((data || []) as Array<{ province_name: string }>).map(d => d.province_name).filter(Boolean).sort();
    },
  });

  const { data: provincePropertyCounts = {}, refetch: refetchCounts } = useQuery({
    queryKey: ["province-property-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("state");
      if (error) return {};
      const counts: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        if (p.state) counts[p.state] = (counts[p.state] || 0) + 1;
      });
      return counts;
    },
  });

  const doneProvinces = useMemo(() => provinces.filter(p => (provincePropertyCounts[p] || 0) > 0), [provinces, provincePropertyCounts]);
  const remainingProvinces = useMemo(() => provinces.filter(p => !(provincePropertyCounts[p] || 0)), [provinces, provincePropertyCounts]);

  // Merge saved completed provinces with DB-detected ones for accurate status
  const allCompletedProvinces = useMemo(() => {
    const set = new Set(doneProvinces);
    if (autoRunState?.completedProvinces) {
      autoRunState.completedProvinces.forEach(p => set.add(p));
    }
    return Array.from(set).sort();
  }, [doneProvinces, autoRunState]);

  const actualRemainingProvinces = useMemo(() => {
    const completedSet = new Set(allCompletedProvinces);
    return provinces.filter(p => !completedSet.has(p));
  }, [provinces, allCompletedProvinces]);

  const { data: kelurahanCount = 0 } = useQuery({
    queryKey: ["kelurahan-count", selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return 0;
      const { data, error } = await supabase
        .from("locations")
        .select("subdistrict_name")
        .eq("province_name", selectedProvince)
        .eq("is_active", true)
        .not("subdistrict_name", "is", null);
      if (error) return 0;
      return new Set((data || []).map(d => d.subdistrict_name)).size;
    },
    enabled: !!selectedProvince,
  });

  const { data: existingCount = 0 } = useQuery({
    queryKey: ["existing-properties-count", selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return 0;
      const { count, error } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("state", selectedProvince);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!selectedProvince,
  });

  const totalExpected = kelurahanCount * PROPERTY_TYPES.length;

  const getKelurahanCount = async (province: string): Promise<number> => {
    const { data, error } = await supabase
      .from("locations")
      .select("subdistrict_name")
      .eq("province_name", province)
      .eq("is_active", true)
      .not("subdistrict_name", "is", null);
    if (error) return 0;
    return new Set((data || []).map(d => d.subdistrict_name)).size;
  };

  // Core batch runner for a single province
  const runProvinceGeneration = async (
    province: string,
    startOffset: number = 0,
    onProgress: (p: { created: number; skipped: number; errors: number; processed: number; total: number }) => void,
    onSaveState?: (offset: number, totals: { created: number; skipped: number; errors: number }) => void
  ): Promise<{ created: number; skipped: number; errors: number; cancelled: boolean }> => {
    const provKelurahanCount = await getKelurahanCount(province);
    const totals = { created: 0, skipped: 0, errors: 0, processed: startOffset, total: provKelurahanCount };
    onProgress({ ...totals });

    let offset = startOffset;
    let hasMore = offset < provKelurahanCount;
    let consecutiveErrors = 0;

    while (hasMore && !cancelRef.current) {
      try {
        if (offset % 30 === 0 || consecutiveErrors > 0) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.access_token) {
            toast.error("Session lost. Please log in again and retry.");
            cancelRef.current = true;
            break;
          }
        }

        const { data, error } = await supabase.functions.invoke("seed-sample-properties", {
          body: { province, skipExisting: true, offset },
        });

        if (error) {
          const errorMsg = error.message || '';
          if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid token') || errorMsg.includes('Authentication required')) {
            toast.error("Session expired. Please log in again.");
            cancelRef.current = true;
            break;
          }
          if (errorMsg.includes('Load failed') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
            consecutiveErrors++;
            if (consecutiveErrors >= 3) {
              toast.error("Connection lost. Pausing auto-run.");
              cancelRef.current = true;
              break;
            }
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          totals.errors += 1;
          consecutiveErrors++;
          if (consecutiveErrors >= 5) {
            toast.error("Too many errors. Pausing auto-run.");
            cancelRef.current = true;
            break;
          }
          offset += 5;
          hasMore = offset < provKelurahanCount;
          continue;
        }

        consecutiveErrors = 0;
        totals.created += data.created || 0;
        totals.skipped += data.skipped || 0;
        totals.errors += data.errors || 0;
        totals.processed += data.batchProcessed || 0;
        onProgress({ ...totals });

        if (onSaveState) onSaveState(data.nextOffset ?? offset + 5, totals);

        hasMore = data.hasMore;
        if (data.nextOffset != null) {
          offset = data.nextOffset;
        } else {
          hasMore = false;
        }
      } catch (err: any) {
        consecutiveErrors++;
        if (consecutiveErrors >= 3) {
          cancelRef.current = true;
          break;
        }
        await new Promise(r => setTimeout(r, 2000));
        offset += 5;
        hasMore = offset < provKelurahanCount;
      }
    }

    return { ...totals, cancelled: cancelRef.current };
  };

  // Single province generation (manual mode)
  const handleGenerate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("You must be logged in to generate properties.");
      return;
    }

    suppressSessionCheck(true);
    cancelRef.current = false;
    setIsRunning(true);
    setResult(null);

    const result = await runProvinceGeneration(selectedProvince, 0, (p) => setProgress(p));

    suppressSessionCheck(false);
    setIsRunning(false);
    setResult(result);
    refetchCounts();

    if (result.cancelled) {
      toast.info("Generation paused/cancelled");
    } else {
      toast.success(`Done! Created ${result.created} properties for ${selectedProvince}`);
    }
  };

  // Auto-run: process provinces (with smart selection support)
  const startAutoRun = useCallback(async (resumeState?: AutoRunState | null, smartQueue?: string[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("You must be logged in.");
      return;
    }

    suppressSessionCheck(true);
    cancelRef.current = false;
    autoRunningRef.current = true;
    setIsRunning(true);
    setIsAutoMode(true);
    setResult(null);

    let queue: string[];
    let completedList: string[];
    let globalTotals = { created: 0, skipped: 0, errors: 0 };
    let startOffset = 0;
    let currentProv = "";

    if (resumeState) {
      // Resume from saved state — skip already completed, start from where we left off
      queue = resumeState.provincesQueue.filter(p => !allCompletedProvinces.includes(p) || p === resumeState.currentProvince);
      completedList = resumeState.completedProvinces;
      globalTotals = { created: resumeState.totalCreated, skipped: resumeState.totalSkipped, errors: resumeState.totalErrors };
      currentProv = resumeState.currentProvince;
      startOffset = resumeState.currentOffset;
      toast.info(`Resuming from ${currentProv} (offset ${startOffset}), ${queue.length} provinces left`);
    } else if (smartQueue && smartQueue.length > 0) {
      // Smart selection — use user-picked provinces
      queue = [...smartQueue];
      completedList = [];
      currentProv = queue[0];
      toast.info(`Smart run: ${queue.length} selected provinces`);
    } else {
      // Fresh start — only truly remaining provinces (skip DB-completed ones)
      queue = [...actualRemainingProvinces];
      completedList = [];
      if (queue.length === 0) {
        toast.info("All provinces already have properties!");
        suppressSessionCheck(false);
        setIsRunning(false);
        setIsAutoMode(false);
        return;
      }
      currentProv = queue[0];
      toast.info(`Starting auto-run for ${queue.length} remaining provinces`);
    }

    setAutoTotalProvinces(queue.length + completedList.length);

    let idx = resumeState ? completedList.length : 0;

    while (queue.length > 0 && !cancelRef.current) {
      const province = currentProv || queue[0];
      setAutoCurrentProvince(province);
      setAutoProvinceIndex(idx + 1);

      const state: AutoRunState = {
        isAutoMode: true,
        completedProvinces: completedList,
        currentProvince: province,
        currentOffset: startOffset,
        totalCreated: globalTotals.created,
        totalSkipped: globalTotals.skipped,
        totalErrors: globalTotals.errors,
        provincesQueue: queue,
        startedAt: resumeState?.startedAt || Date.now(),
        lastUpdated: Date.now(),
      };
      setAutoRunState(state);
      saveAutoRunState(state);

      const provResult = await runProvinceGeneration(
        province,
        startOffset,
        (p) => setProgress(p),
        (offset, totals) => {
          const updatedState: AutoRunState = {
            ...state,
            currentOffset: offset,
            totalCreated: globalTotals.created + totals.created,
            totalSkipped: globalTotals.skipped + totals.skipped,
            totalErrors: globalTotals.errors + totals.errors,
            lastUpdated: Date.now(),
          };
          saveAutoRunState(updatedState);
        }
      );

      if (provResult.cancelled) {
        const pausedState: AutoRunState = {
          isAutoMode: true,
          completedProvinces: completedList,
          currentProvince: province,
          currentOffset: startOffset,
          totalCreated: globalTotals.created + provResult.created,
          totalSkipped: globalTotals.skipped + provResult.skipped,
          totalErrors: globalTotals.errors + provResult.errors,
          provincesQueue: queue,
          startedAt: resumeState?.startedAt || Date.now(),
          lastUpdated: Date.now(),
        };
        setAutoRunState(pausedState);
        saveAutoRunState(pausedState);
        toast.info(`Auto-run paused at ${province}. You can resume anytime.`);
        break;
      }

      globalTotals.created += provResult.created;
      globalTotals.skipped += provResult.skipped;
      globalTotals.errors += provResult.errors;

      completedList.push(province);
      queue.shift();
      startOffset = 0;
      currentProv = queue[0] || "";
      idx++;

      refetchCounts();
      toast.success(`✓ ${province} done (${provResult.created} created). ${queue.length} provinces left.`);
    }

    suppressSessionCheck(false);
    autoRunningRef.current = false;
    setIsRunning(false);

    if (!cancelRef.current) {
      clearAutoRunState();
      setAutoRunState(null);
      setSmartSelectedProvinces([]);
      setResult({ ...globalTotals, allDone: true });
      toast.success(`🎉 Auto-run complete! ${globalTotals.created} total properties created across ${completedList.length} provinces.`);
      refetchCounts();
    }
  }, [actualRemainingProvinces, allCompletedProvinces, refetchCounts]);

  const handleAutoRun = () => startAutoRun(null);
  const handleResumeAutoRun = () => startAutoRun(autoRunState);
  const handleSmartRun = () => {
    if (smartSelectedProvinces.length === 0) {
      toast.error("Select at least one province for smart run.");
      return;
    }
    startAutoRun(null, smartSelectedProvinces);
  };
  const handleClearAutoState = () => {
    clearAutoRunState();
    setAutoRunState(null);
    setIsAutoMode(false);
    setSmartSelectedProvinces([]);
    toast.info("Auto-run state cleared.");
  };

  const toggleSmartProvince = (province: string) => {
    setSmartSelectedProvinces(prev =>
      prev.includes(province)
        ? prev.filter(p => p !== province)
        : [...prev, province]
    );
  };

  const selectAllRemaining = () => setSmartSelectedProvinces([...actualRemainingProvinces]);
  const clearSmartSelection = () => setSmartSelectedProvinces([]);

  const progressPercent = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;
  const hasSavedState = !!autoRunState && autoRunState.provincesQueue.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold">Sample Property Generator</h2>
          <p className="text-xs text-muted-foreground">Generate sample properties for each kelurahan/desa per province</p>
        </div>
      </div>

      {/* Auto-Run Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Auto-Run All Remaining
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] gap-1 border-green-500/30 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {allCompletedProvinces.length} done
              </Badge>
              <Badge variant="outline" className="text-[10px] gap-1 border-orange-500/30 text-orange-500">
                {actualRemainingProvinces.length} remaining
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            Progress is saved — auto-run resumes from where you left off. Use Smart Selection to pick specific provinces.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {/* Saved state resume banner */}
          {hasSavedState && !isRunning && (
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2">
                <Pause className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Paused Auto-Run</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Current: <span className="font-medium text-foreground">{autoRunState!.currentProvince}</span></div>
                <div>Offset: <span className="font-medium text-foreground">{autoRunState!.currentOffset}</span></div>
                <div>Completed: <span className="font-medium text-green-600">{autoRunState!.completedProvinces.length} provinces</span></div>
                <div>Remaining: <span className="font-medium text-orange-500">{autoRunState!.provincesQueue.length} provinces</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <span className="font-bold text-green-600">{autoRunState!.totalCreated}</span>
                  <p className="text-[9px] text-muted-foreground">Created</p>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <span className="font-bold text-orange-500">{autoRunState!.totalSkipped}</span>
                  <p className="text-[9px] text-muted-foreground">Skipped</p>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <span className="font-bold text-red-500">{autoRunState!.totalErrors}</span>
                  <p className="text-[9px] text-muted-foreground">Errors</p>
                </div>
              </div>
              {autoRunState!.completedProvinces.length > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  <span className="font-medium">Done: </span>
                  {autoRunState!.completedProvinces.join(", ")}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-1.5 h-8 text-xs" onClick={handleResumeAutoRun}>
                  <Play className="h-3.5 w-3.5" />
                  Resume Auto-Run
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={handleClearAutoState}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Auto-run progress */}
          {isRunning && isAutoMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-medium">
                    Province {autoProvinceIndex}/{autoTotalProvinces}: {autoCurrentProvince}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { cancelRef.current = true; }}
                  className="gap-1 h-7 text-xs"
                >
                  <StopCircle className="h-3.5 w-3.5" />
                  Pause
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Overall provinces</span>
                  <span>{autoProvinceIndex}/{autoTotalProvinces}</span>
                </div>
                <Progress value={(autoProvinceIndex / autoTotalProvinces) * 100} className="h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Current province batches</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="text-green-600">✓ {progress.created} created</span>
                <span className="text-orange-500">⊘ {progress.skipped} skipped</span>
                <span className="text-red-500">✗ {progress.errors} errors</span>
              </div>
            </div>
          )}

          {/* Province Status & Smart Selection */}
          {!isRunning && (
            <div className="space-y-2">
              <button
                onClick={() => setShowProvinceList(!showProvinceList)}
                className="flex items-center gap-2 w-full text-left text-xs font-semibold text-foreground/80 hover:text-foreground transition-colors"
              >
                <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                <span>Province Status & Smart Selection</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 ml-1">
                  {smartSelectedProvinces.length > 0 ? `${smartSelectedProvinces.length} selected` : "click to expand"}
                </Badge>
                {showProvinceList ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
              </button>

              {showProvinceList && (
                <div className="space-y-2 border rounded-lg p-3 bg-background/50">
                  {/* Quick actions */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={selectAllRemaining} disabled={actualRemainingProvinces.length === 0}>
                      Select All Remaining
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={clearSmartSelection} disabled={smartSelectedProvinces.length === 0}>
                      Clear Selection
                    </Button>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {smartSelectedProvinces.length}/{actualRemainingProvinces.length} selected
                    </span>
                  </div>

                  {/* Remaining provinces */}
                  {actualRemainingProvinces.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-orange-500 mb-1.5 uppercase tracking-wider">
                        Remaining ({actualRemainingProvinces.length})
                      </p>
                      <ScrollArea className="max-h-40">
                        <div className="grid grid-cols-2 gap-1">
                          {actualRemainingProvinces.map(p => (
                            <button
                              key={p}
                              onClick={() => toggleSmartProvince(p)}
                              className={cn(
                                "flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded-md border transition-all text-left",
                                smartSelectedProvinces.includes(p)
                                  ? "border-primary bg-primary/10 text-primary font-medium"
                                  : "border-border/50 hover:border-primary/40 hover:bg-muted/50 text-foreground/80"
                              )}
                            >
                              <div className={cn(
                                "w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0",
                                smartSelectedProvinces.includes(p)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30"
                              )}>
                                {smartSelectedProvinces.includes(p) && <Check className="h-2.5 w-2.5" />}
                              </div>
                              <span className="truncate">{p}</span>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Completed provinces */}
                  {allCompletedProvinces.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-green-600 mb-1.5 uppercase tracking-wider">
                        Completed ({allCompletedProvinces.length})
                      </p>
                      <ScrollArea className="max-h-32">
                        <div className="grid grid-cols-2 gap-1">
                          {allCompletedProvinces.map(p => (
                            <div
                              key={p}
                              className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded-md border border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400"
                            >
                              <CheckCircle className="h-3 w-3 shrink-0" />
                              <span className="truncate">{p}</span>
                              <span className="ml-auto text-[9px] text-green-600/60 shrink-0">
                                {provincePropertyCounts[p] || "✓"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Start / Smart Run buttons */}
          {!isRunning && !hasSavedState && (
            <div className="flex gap-2">
              {smartSelectedProvinces.length > 0 ? (
                <Button
                  className="flex-1 gap-2 h-9 text-sm"
                  onClick={handleSmartRun}
                >
                  <MousePointerClick className="h-4 w-4" />
                  Smart Run {smartSelectedProvinces.length} Selected
                </Button>
              ) : (
                <Button
                  className="flex-1 gap-2 h-9 text-sm"
                  disabled={isRunning || actualRemainingProvinces.length === 0}
                  onClick={handleAutoRun}
                >
                  <Zap className="h-4 w-4" />
                  {actualRemainingProvinces.length === 0
                    ? "All Provinces Complete!"
                    : `Auto-Generate ${actualRemainingProvinces.length} Remaining Provinces`}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Single Province Card */}
      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Single Province (Manual)
          </CardTitle>
          <CardDescription className="text-xs">
            Or pick a specific province to generate individually.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={provinceOpen}
                disabled={isRunning}
                className="w-full justify-between font-normal h-9 text-sm"
              >
                {selectedProvince || (loadingProvinces ? "Loading..." : "Select a province...")}
                <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover border border-border shadow-lg z-50" align="start">
              <Command>
                <CommandInput placeholder="Search province..." />
                <CommandList className="max-h-64">
                  <CommandEmpty>No province found.</CommandEmpty>
                  {actualRemainingProvinces.length > 0 && (
                    <CommandGroup heading={`Remaining (${actualRemainingProvinces.length})`}>
                      {actualRemainingProvinces.map((p) => (
                        <CommandItem key={p} value={p} onSelect={() => handleProvinceSelect(p)} className="text-sm">
                          <Check className={cn("mr-2 h-3.5 w-3.5", selectedProvince === p ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1">{p}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-orange-500/30 text-orange-500 ml-2">new</Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {allCompletedProvinces.length > 0 && (
                    <CommandGroup heading={`Done (${allCompletedProvinces.length})`}>
                      {allCompletedProvinces.map((p) => (
                        <CommandItem key={p} value={p} onSelect={() => handleProvinceSelect(p)} className="text-sm">
                          <Check className={cn("mr-2 h-3.5 w-3.5", selectedProvince === p ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1">{p}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-green-500/30 text-green-600 ml-2">
                            {provincePropertyCounts[p] || "✓"} props
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedProvince && (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold text-primary">{kelurahanCount}</p>
                <p className="text-[10px] text-muted-foreground">Kelurahan/Desa</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold text-primary">{totalExpected}</p>
                <p className="text-[10px] text-muted-foreground">To Create</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold text-orange-500">{existingCount}</p>
                <p className="text-[10px] text-muted-foreground">Existing</p>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Property Types (1 per kelurahan)</Label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map((type) => (
                <Badge key={type} variant="secondary" className="text-[10px] px-2 py-0.5 capitalize">{type}</Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border">
            <div>
              <Label className="text-xs font-medium">Skip existing kelurahan</Label>
              <p className="text-[10px] text-muted-foreground">Skip kelurahan that already have properties</p>
            </div>
            <Switch checked={skipExisting} onCheckedChange={setSkipExisting} disabled={isRunning} />
          </div>

          {selectedProvince && totalExpected > 100 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-orange-700 dark:text-orange-300 leading-relaxed">
                <span className="font-semibold">Large batch:</span> {totalExpected} properties in batches of {PROPERTY_TYPES.length * 5}. You can cancel anytime.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2 h-9 text-sm"
              disabled={!selectedProvince || isRunning}
              onClick={handleGenerate}
            >
              <ImageIcon className="h-4 w-4" />
              Generate {totalExpected} Properties
            </Button>
            {isRunning && !isAutoMode && (
              <Button
                variant="destructive"
                onClick={() => { cancelRef.current = true; }}
                className="gap-1.5 h-9 text-sm"
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Single province progress */}
      {isRunning && !isAutoMode && (
        <Card>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs font-medium">
                Processing batch {Math.ceil(progress.processed / 5)} of {Math.ceil(progress.total / 5)}...
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="text-green-600">✓ {progress.created} created</span>
              <span className="text-orange-500">⊘ {progress.skipped} skipped</span>
              <span className="text-red-500">✗ {progress.errors} errors</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !isRunning && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {result.allDone ? "🎉 All Provinces Complete!" : "Generation Complete!"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-md bg-background/50">
                    <p className="text-base font-bold text-green-600">{result.created}</p>
                    <p className="text-[10px] text-muted-foreground">Created</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-background/50">
                    <p className="text-base font-bold text-orange-500">{result.skipped}</p>
                    <p className="text-[10px] text-muted-foreground">Skipped</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-background/50">
                    <p className="text-base font-bold text-red-500">{result.errors}</p>
                    <p className="text-[10px] text-muted-foreground">Errors</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SamplePropertyGenerator;
