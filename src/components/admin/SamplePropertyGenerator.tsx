import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { suppressSessionCheck } from "@/hooks/useSessionMonitor";
import { useSpgCheckpoints } from "@/hooks/useSpgCheckpoints";
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
import { Sparkles, MapPin, Loader2, CheckCircle, AlertTriangle, ImageIcon, StopCircle, ChevronsUpDown, Check, Play, Pause, RotateCcw, Zap, ChevronDown, ChevronUp, MousePointerClick, Clock, Building2, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'land', 'commercial', 'townhouse', 'warehouse', 'kost'];

const AUTO_RUN_STORAGE_KEY = 'spg_auto_run_state';
const DONE_PROVINCES_KEY = 'spg_done_provinces_v2'; // v2 with timestamps + details

interface DoneProvinceRecord {
  province: string;
  completedAt: string; // ISO timestamp
  created: number;
  skipped: number;
  errors: number;
  cities: string[];
  areas: string[];
}

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
  currentCity?: string;
  currentArea?: string;
  recentLocations?: Array<{ city: string; area: string; types_created: number }>;
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

// Persistent done provinces with details
const loadDoneProvinces = (): DoneProvinceRecord[] => {
  try {
    const stored = localStorage.getItem(DONE_PROVINCES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Migration: if old format (string[]), convert
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed.map((p: string) => ({
        province: p,
        completedAt: new Date().toISOString(),
        created: 0, skipped: 0, errors: 0,
        cities: [], areas: [],
      }));
    }
    return parsed;
  } catch { return []; }
};

const saveDoneProvince = (record: DoneProvinceRecord) => {
  try {
    const list = loadDoneProvinces();
    const idx = list.findIndex(r => r.province === record.province);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    localStorage.setItem(DONE_PROVINCES_KEY, JSON.stringify(list));
  } catch {}
};

const clearDoneProvinces = () => {
  try { localStorage.removeItem(DONE_PROVINCES_KEY); } catch {}
};

const getDoneProvinceNames = (): Set<string> => {
  return new Set(loadDoneProvinces().map(r => r.province));
};

const formatDuration = (ms: number): string => {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  if (mins < 60) return `${mins}m ${remSecs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
};

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

const SamplePropertyGenerator = () => {
  const queryClient = useQueryClient();
  const {
    saveAutoRunCheckpoint,
    loadAutoRunCheckpoint,
    clearAutoRunCheckpoint,
    saveDoneProvinceCheckpoint,
    loadDoneProvinceCheckpoints,
    clearAllCheckpoints,
  } = useSpgCheckpoints();
  const [selectedProvince, setSelectedProvince] = useState(() => localStorage.getItem('spg_last_province') || "");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ created: 0, skipped: 0, errors: 0, processed: 0, total: 0, existingCount: 0 });
  const [result, setResult] = useState<any>(null);
  const cancelRef = useRef(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');

  // Live location tracking
  const [liveCity, setLiveCity] = useState("");
  const [liveArea, setLiveArea] = useState("");
  const [recentLocations, setRecentLocations] = useState<Array<{ city: string; area: string; types_created: number }>>([]);
  const [provinceCitiesDone, setProvinceCitiesDone] = useState<string[]>([]);
  const [provinceAreasDone, setProvinceAreasDone] = useState<string[]>([]);
  const [runStartTime, setRunStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [authStatus, setAuthStatus] = useState<'valid' | 'refreshing' | 'expired' | 'checking'>('checking');

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
  const [showHistory, setShowHistory] = useState(false);

  // Load checkpoints from Supabase on mount (merge with localStorage)
  useEffect(() => {
    const syncFromCloud = async () => {
      try {
        setCloudSyncStatus('syncing');
        // Load done provinces from cloud and merge with localStorage
        const cloudDone = await loadDoneProvinceCheckpoints();
        if (cloudDone.length > 0) {
          const localDone = loadDoneProvinces();
          const merged = new Map<string, DoneProvinceRecord>();
          localDone.forEach(r => merged.set(r.province, r));
          cloudDone.forEach(r => {
            const existing = merged.get(r.province);
            if (!existing || new Date(r.completedAt) > new Date(existing.completedAt)) {
              merged.set(r.province, r);
            }
          });
          const mergedList = Array.from(merged.values());
          localStorage.setItem(DONE_PROVINCES_KEY, JSON.stringify(mergedList));
          setPersistedDoneRecords(mergedList);
        }

        // Load auto-run checkpoint from cloud if no local state
        const localState = loadAutoRunState();
        if (!localState) {
          const cloudState = await loadAutoRunCheckpoint();
          if (cloudState && cloudState.provincesQueue.length > 0) {
            const asLocal: AutoRunState = { ...cloudState, recentLocations: [] };
            saveAutoRunState(asLocal);
            setAutoRunState(asLocal);
          }
        }
        setCloudSyncStatus('synced');
      } catch {
        setCloudSyncStatus('error');
      }
    };
    syncFromCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth status monitor
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthStatus(session?.access_token ? 'valid' : 'expired');
    };
    checkAuth();
    const interval = setInterval(checkAuth, 30000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setAuthStatus(event === 'SIGNED_OUT' ? 'expired' : 'valid');
      }
    });
    return () => { clearInterval(interval); subscription.unsubscribe(); };
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning || !runStartTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - runStartTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, runStartTime]);

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

  const [persistedDoneRecords, setPersistedDoneRecords] = useState<DoneProvinceRecord[]>(() => loadDoneProvinces());
  const persistedDoneNames = useMemo(() => new Set(persistedDoneRecords.map(r => r.province)), [persistedDoneRecords]);

  const allCompletedProvinces = useMemo(() => {
    const set = new Set(doneProvinces);
    persistedDoneNames.forEach(p => set.add(p));
    if (autoRunState?.completedProvinces) {
      autoRunState.completedProvinces.forEach(p => set.add(p));
    }
    return Array.from(set).sort();
  }, [doneProvinces, autoRunState, persistedDoneNames]);

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

  // Core batch runner
  const runProvinceGeneration = async (
    province: string,
    startOffset: number = 0,
    onProgress: (p: { created: number; skipped: number; errors: number; processed: number; total: number; existingCount: number }) => void,
    onSaveState?: (offset: number, totals: { created: number; skipped: number; errors: number }, locInfo?: { city: string; area: string }) => void
  ): Promise<{ created: number; skipped: number; errors: number; cancelled: boolean; cities: string[]; areas: string[] }> => {
    const provKelurahanCount = await getKelurahanCount(province);
    const totals = { created: 0, skipped: 0, errors: 0, processed: startOffset * 5, total: provKelurahanCount, existingCount: 0 };
    onProgress({ ...totals });

    let offset = startOffset;
    let hasMore = true;
    let consecutiveErrors = 0;
    let accessToken: string | null = null;
    const citiesSet = new Set<string>();
    const areasSet = new Set<string>();

    while (hasMore && !cancelRef.current) {
      try {
        if (!accessToken || offset % 10 === 0 || consecutiveErrors > 0) {
          setAuthStatus('checking');
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.access_token) {
            setAuthStatus('expired');
            toast.error("Session lost. Please log in again and retry.");
            cancelRef.current = true;
            break;
          }
          setAuthStatus('valid');
          accessToken = currentSession.access_token;
        }

        const invokeBatch = async (token: string) =>
          supabase.functions.invoke("seed-sample-properties", {
            body: { province, skipExisting: true, offset },
            headers: { Authorization: `Bearer ${token}` },
          });

        if (!accessToken) {
          toast.error("Session lost. Please log in again and retry.");
          cancelRef.current = true;
          break;
        }

        let { data, error } = await invokeBatch(accessToken);

        if (error) {
          const errorMsg = error.message || '';
          if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid token')) {
            setAuthStatus('refreshing');
            const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
            const refreshedToken = refreshed.session?.access_token;

            if (refreshErr || !refreshedToken) {
              setAuthStatus('expired');
              toast.error("Session expired. Please log in again.");
              cancelRef.current = true;
              break;
            }

            setAuthStatus('valid');
            accessToken = refreshedToken;
            const retry = await invokeBatch(refreshedToken);
            data = retry.data;
            error = retry.error;
          }
        }

        if (error) {
          const errorMsg = error.message || '';
          if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid token')) {
            toast.error("Session expired. Please log in again.");
            cancelRef.current = true;
            break;
          }
          if (errorMsg.includes('Load failed') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
            consecutiveErrors++;
            if (consecutiveErrors >= 3) {
              toast.error("Connection lost. Pausing.");
              cancelRef.current = true;
              break;
            }
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          totals.errors += 1;
          consecutiveErrors++;
          if (consecutiveErrors >= 5) {
            toast.error("Too many errors. Pausing.");
            cancelRef.current = true;
            break;
          }
          offset += 1;
          continue;
        }

        consecutiveErrors = 0;
        totals.created += data.created || 0;
        totals.skipped += data.skipped || 0;
        totals.errors += data.errors || 0;
        totals.processed += data.batchProcessed || 0;

        // Track locations
        const locs = data.locations_processed || [];
        locs.forEach((l: any) => {
          if (l.city) citiesSet.add(l.city);
          if (l.area) areasSet.add(l.area);
        });
        if (locs.length > 0) {
          const lastLoc = locs[locs.length - 1];
          setLiveCity(lastLoc.city || "");
          setLiveArea(lastLoc.area || "");
          setRecentLocations(prev => [...locs, ...prev].slice(0, 20));
          setProvinceCitiesDone(Array.from(citiesSet));
          setProvinceAreasDone(Array.from(areasSet));
        }

        totals.existingCount = data.existing_count || 0;
        onProgress({ ...totals, total: data.total_kelurahan || provKelurahanCount });

        if (onSaveState) {
          const lastLoc = locs.length > 0 ? locs[locs.length - 1] : null;
          onSaveState(data.nextOffset ?? offset + 1, totals, lastLoc ? { city: lastLoc.city, area: lastLoc.area } : undefined);
        }

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
        offset += 1;
      }
    }

    return { ...totals, cancelled: cancelRef.current, cities: Array.from(citiesSet), areas: Array.from(areasSet) };
  };

  // Single province generation
  const handleGenerate = async () => {
    if (!selectedProvince) {
      toast.error("Please select a province first.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error("You must be logged in.");
      return;
    }

    suppressSessionCheck(true);
    cancelRef.current = false;
    setIsAutoMode(false);
    setIsRunning(true);
    setResult(null);
    setRecentLocations([]);
    setProvinceCitiesDone([]);
    setProvinceAreasDone([]);
    setLiveCity("");
    setLiveArea("");
    setRunStartTime(Date.now());
    setElapsedTime(0);

    const provResult = await runProvinceGeneration(selectedProvince, 0, (p) => setProgress(p));

    suppressSessionCheck(false);
    setIsRunning(false);
    setResult({ ...provResult, province: selectedProvince });

    if (!provResult.cancelled) {
      const record: DoneProvinceRecord = {
        province: selectedProvince,
        completedAt: new Date().toISOString(),
        created: provResult.created,
        skipped: provResult.skipped,
        errors: provResult.errors,
        cities: provResult.cities,
        areas: provResult.areas,
      };
      saveDoneProvince(record);
      setPersistedDoneRecords(prev => {
        const filtered = prev.filter(r => r.province !== selectedProvince);
        return [...filtered, record];
      });
      toast.success(`Done! Created ${provResult.created} properties for ${selectedProvince} (${provResult.cities.length} cities, ${provResult.areas.length} areas)`);
    } else {
      toast.info("Generation paused/cancelled");
    }
    refetchCounts();
  };

  // Auto-run
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
    setRecentLocations([]);
    setProvinceCitiesDone([]);
    setProvinceAreasDone([]);
    setLiveCity("");
    setLiveArea("");
    setRunStartTime(Date.now());
    setElapsedTime(0);

    const doneLive = getDoneProvinceNames();

    let queue: string[];
    let completedList: string[];
    let globalTotals = { created: 0, skipped: 0, errors: 0 };
    let startOffset = 0;
    let currentProv = "";

    if (resumeState) {
      queue = resumeState.provincesQueue.filter(p => !doneLive.has(p) || p === resumeState.currentProvince);
      completedList = resumeState.completedProvinces;
      globalTotals = { created: resumeState.totalCreated, skipped: resumeState.totalSkipped, errors: resumeState.totalErrors };
      currentProv = resumeState.currentProvince;
      startOffset = resumeState.currentOffset;
      toast.info(`Resuming from ${currentProv} (offset ${startOffset}), ${queue.length} provinces left`);
    } else if (smartQueue && smartQueue.length > 0) {
      queue = smartQueue.filter(p => !doneLive.has(p));
      completedList = [];
      if (queue.length === 0) {
        toast.info("All selected provinces are already done!");
        suppressSessionCheck(false);
        setIsRunning(false);
        setIsAutoMode(false);
        return;
      }
      currentProv = queue[0];
      toast.info(`Smart run: ${queue.length} selected provinces`);
    } else {
      const allDoneNow = new Set([...doneLive, ...doneProvinces]);
      queue = provinces.filter(p => !allDoneNow.has(p));
      completedList = [];
      if (queue.length === 0) {
        toast.info("All provinces already done! Click Reset to re-run.");
        suppressSessionCheck(false);
        setIsRunning(false);
        setIsAutoMode(false);
        return;
      }
      currentProv = queue[0];
      toast.info(`Starting auto-run for ${queue.length} remaining provinces (skipping ${allDoneNow.size} done)`);
    }

    setAutoTotalProvinces(queue.length + completedList.length);

    let idx = resumeState ? completedList.length : 0;

    while (queue.length > 0 && !cancelRef.current) {
      const province = currentProv || queue[0];
      setAutoCurrentProvince(province);
      setAutoProvinceIndex(idx + 1);
      setRecentLocations([]);
      setProvinceCitiesDone([]);
      setProvinceAreasDone([]);
      setLiveCity("");
      setLiveArea("");

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
        (offset, totals, locInfo) => {
          const updatedState: AutoRunState = {
            ...state,
            currentOffset: offset,
            totalCreated: globalTotals.created + totals.created,
            totalSkipped: globalTotals.skipped + totals.skipped,
            totalErrors: globalTotals.errors + totals.errors,
            lastUpdated: Date.now(),
            currentCity: locInfo?.city,
            currentArea: locInfo?.area,
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
          currentCity: liveCity,
          currentArea: liveArea,
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
      const record: DoneProvinceRecord = {
        province,
        completedAt: new Date().toISOString(),
        created: provResult.created,
        skipped: provResult.skipped,
        errors: provResult.errors,
        cities: provResult.cities,
        areas: provResult.areas,
      };
      saveDoneProvince(record);
      setPersistedDoneRecords(prev => {
        const filtered = prev.filter(r => r.province !== province);
        return [...filtered, record];
      });

      queue.shift();
      startOffset = 0;
      currentProv = queue[0] || "";
      idx++;

      refetchCounts();
      toast.success(`✓ ${province} done (${provResult.created} created, ${provResult.cities.length} cities). ${queue.length} left.`);
    }

    suppressSessionCheck(false);
    autoRunningRef.current = false;
    setIsRunning(false);

    if (!cancelRef.current) {
      clearAutoRunState();
      setAutoRunState(null);
      setSmartSelectedProvinces([]);
      setResult({ ...globalTotals, allDone: true });
      toast.success(`🎉 Auto-run complete! ${globalTotals.created} total properties across ${completedList.length} provinces.`);
      refetchCounts();
    }
  }, [provinces, doneProvinces, refetchCounts, liveCity, liveArea]);

  const handleAutoRun = () => {
    const saved = loadAutoRunState();
    if (saved && saved.provincesQueue.length > 0) {
      toast.info("Resuming from saved progress...");
      startAutoRun(saved);
    } else {
      startAutoRun(null);
    }
  };
  const handleResumeAutoRun = () => startAutoRun(autoRunState);
  const handleSmartRun = () => {
    if (smartSelectedProvinces.length === 0) {
      toast.error("Select at least one province.");
      return;
    }
    startAutoRun(null, smartSelectedProvinces);
  };
  const handleClearAutoState = () => {
    clearAutoRunState();
    clearDoneProvinces();
    setAutoRunState(null);
    setPersistedDoneRecords([]);
    setIsAutoMode(false);
    setSmartSelectedProvinces([]);
    toast.info("Auto-run state and history cleared.");
  };

  const toggleSmartProvince = (province: string) => {
    setSmartSelectedProvinces(prev =>
      prev.includes(province) ? prev.filter(p => p !== province) : [...prev, province]
    );
  };

  const selectAllRemaining = () => setSmartSelectedProvinces([...actualRemainingProvinces]);
  const clearSmartSelection = () => setSmartSelectedProvinces([]);

  const progressPercent = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;
  const hasSavedState = !!autoRunState && autoRunState.provincesQueue.length > 0;

  // Get done record for a province
  const getDoneRecord = (prov: string): DoneProvinceRecord | undefined =>
    persistedDoneRecords.find(r => r.province === prov);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold">Sample Property Generator</h2>
            <p className="text-xs text-muted-foreground">Generate sample properties for each kelurahan/desa per province</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 text-[10px] font-medium px-2 py-0.5 border",
            authStatus === 'valid' && "border-chart-1/30 bg-chart-1/10 text-chart-1",
            authStatus === 'refreshing' && "border-chart-3/30 bg-chart-3/10 text-chart-3 animate-pulse",
            authStatus === 'expired' && "border-destructive/30 bg-destructive/10 text-destructive",
            authStatus === 'checking' && "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
          )}
        >
          {authStatus === 'valid' && <><CheckCircle className="h-3 w-3" /> Session Valid</>}
          {authStatus === 'refreshing' && <><Loader2 className="h-3 w-3 animate-spin" /> Refreshing</>}
          {authStatus === 'expired' && <><AlertTriangle className="h-3 w-3" /> Expired</>}
          {authStatus === 'checking' && <><Loader2 className="h-3 w-3 animate-spin" /> Checking</>}
        </Badge>
      </div>

      {/* Progress Overview */}
      {provinces.length > 0 && (
        <Card className="border-border">
          <CardHeader className="px-4 py-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-chart-1" />
                Progress Overview
              </CardTitle>
              <span className="text-xs text-muted-foreground font-medium">
                {allCompletedProvinces.length}/{provinces.length} provinces
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <div className="space-y-1.5">
              <Progress
                value={provinces.length > 0 ? (allCompletedProvinces.length / provinces.length) * 100 : 0}
                multiColor
                className="h-2.5"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{Math.round((allCompletedProvinces.length / provinces.length) * 100)}% complete</span>
                <span>
                  {Object.values(provincePropertyCounts).reduce((a, b) => a + b, 0).toLocaleString()} total properties
                </span>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-chart-1/10 border border-chart-1/20">
                <p className="text-lg font-bold text-chart-1">{allCompletedProvinces.length}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Completed</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <p className="text-lg font-bold text-chart-3">{actualRemainingProvinces.length}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Remaining</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-lg font-bold text-primary">{provinces.length}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total</p>
              </div>
            </div>

            {/* Completed provinces collapsible */}
            {allCompletedProvinces.length > 0 && (
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-chart-1 hover:text-chart-1/80 transition-colors list-none">
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  Completed Provinces ({allCompletedProvinces.length})
                </summary>
                <ScrollArea className="max-h-52 mt-2">
                  <div className="space-y-1">
                    {allCompletedProvinces.map(p => {
                      const rec = getDoneRecord(p);
                      const count = provincePropertyCounts[p] || rec?.created || 0;
                      return (
                        <div key={p} className="rounded-md border border-chart-1/20 bg-chart-1/5 px-2.5 py-1.5">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <CheckCircle className="h-3 w-3 text-chart-1 shrink-0" />
                            <span className="font-medium text-foreground truncate">{p}</span>
                            <span className="ml-auto text-[9px] text-chart-1 shrink-0 font-medium">
                              {count} props
                            </span>
                          </div>
                          {rec && (
                            <div className="mt-1 pl-[18px] space-y-0.5 text-[9px] text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {formatTime(rec.completedAt)}
                                <span className="mx-1">•</span>
                                +{rec.created} created, {rec.skipped} skipped
                              </div>
                              {rec.cities.length > 0 && (
                                <div className="truncate">
                                  <span className="font-medium">Cities:</span> {rec.cities.slice(0, 4).join(", ")}
                                  {rec.cities.length > 4 && ` +${rec.cities.length - 4}`}
                                </div>
                              )}
                              {rec.areas.length > 0 && (
                                <div className="truncate">
                                  <span className="font-medium">Areas:</span> {rec.areas.slice(0, 6).join(", ")}
                                  {rec.areas.length > 6 && ` +${rec.areas.length - 6}`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </details>
            )}

            {/* Uncompleted provinces collapsible */}
            {actualRemainingProvinces.length > 0 && (
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-chart-3 hover:text-chart-3/80 transition-colors list-none">
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  Uncompleted Provinces ({actualRemainingProvinces.length})
                </summary>
                <ScrollArea className="max-h-40 mt-2">
                  <div className="grid grid-cols-2 gap-1">
                    {actualRemainingProvinces.map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md border border-chart-3/20 bg-chart-3/5">
                        <AlertTriangle className="h-3 w-3 text-chart-3 shrink-0" />
                        <span className="text-foreground/80 truncate">{p}</span>
                        <Badge variant="outline" className="ml-auto text-[8px] px-1 py-0 h-3.5 border-chart-3/30 text-chart-3 shrink-0">
                          pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auto-Run Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Auto-Run All Remaining
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] gap-1 border-chart-1/30 text-chart-1">
                <CheckCircle className="h-3 w-3" />
                {allCompletedProvinces.length} done
              </Badge>
              <Badge variant="outline" className="text-[10px] gap-1 border-chart-3/30 text-chart-3">
                {actualRemainingProvinces.length} remaining
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            Progress is saved real-time — auto-run resumes from exact offset. Use Smart Selection to pick specific provinces.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {/* Saved state resume banner */}
          {hasSavedState && !isRunning && (
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2">
                <Pause className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Paused Auto-Run</span>
                <span className="text-[9px] text-muted-foreground ml-auto">
                  Last: {formatTime(new Date(autoRunState!.lastUpdated).toISOString())}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Province: <span className="font-medium text-foreground">{autoRunState!.currentProvince}</span></div>
                <div>Offset: <span className="font-medium text-foreground">{autoRunState!.currentOffset}</span></div>
                {autoRunState!.currentCity && (
                  <div>Last City: <span className="font-medium text-foreground">{autoRunState!.currentCity}</span></div>
                )}
                {autoRunState!.currentArea && (
                  <div>Last Area: <span className="font-medium text-foreground">{autoRunState!.currentArea}</span></div>
                )}
                <div>Completed: <span className="font-medium text-chart-1">{autoRunState!.completedProvinces.length} provinces</span></div>
                <div>Remaining: <span className="font-medium text-chart-3">{autoRunState!.provincesQueue.length} provinces</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <span className="font-bold text-chart-1">{autoRunState!.totalCreated}</span>
                  <p className="text-[9px] text-muted-foreground">Created</p>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <span className="font-bold text-chart-3">{autoRunState!.totalSkipped}</span>
                  <p className="text-[9px] text-muted-foreground">Skipped</p>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <span className="font-bold text-destructive">{autoRunState!.totalErrors}</span>
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

          {/* Auto-run live progress */}
          {isRunning && isAutoMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-medium">
                    Province {autoProvinceIndex}/{autoTotalProvinces}: {autoCurrentProvince}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] gap-1 h-5">
                    <Clock className="h-3 w-3" />
                    {formatDuration(elapsedTime)}
                  </Badge>
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
              </div>

              {/* Live city/area info */}
              {(liveCity || liveArea) && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded px-2 py-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    {liveCity && <span className="font-medium text-foreground">{liveCity}</span>}
                    {liveArea && <span> → <span className="font-medium text-foreground">{liveArea}</span></span>}
                  </span>
                  {provinceCitiesDone.length > 0 && (
                    <span className="ml-auto text-[9px]">{provinceCitiesDone.length} cities, {provinceAreasDone.length} areas</span>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Overall provinces</span>
                  <span>{autoProvinceIndex}/{autoTotalProvinces} ({autoTotalProvinces - autoProvinceIndex} remaining)</span>
                </div>
                <Progress value={(autoProvinceIndex / autoTotalProvinces) * 100} className="h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Current province kelurahan</span>
                  <span>{progress.processed}/{progress.total} ({progressPercent}%)</span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
              {progress.existingCount > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-chart-3/5 rounded px-2 py-1 border border-chart-3/10">
                  <Building2 className="h-3 w-3 text-chart-3 shrink-0" />
                  <span>Existing in DB: <span className="font-bold text-chart-3">{progress.existingCount.toLocaleString()}</span> properties</span>
                  <span className="ml-auto">Target remaining: <span className="font-bold text-primary">{Math.max(0, (progress.total * PROPERTY_TYPES.length) - progress.existingCount - progress.created).toLocaleString()}</span></span>
                </div>
              )}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="text-chart-1">✓ {progress.created} created</span>
                <span className="text-chart-3">⊘ {progress.skipped} skipped</span>
                <span className="text-destructive">✗ {progress.errors} errors</span>
              </div>

              {/* Recent locations feed */}
              {recentLocations.length > 0 && (
                <ScrollArea className="max-h-24 rounded border bg-muted/20 p-2">
                  <div className="space-y-0.5">
                    {recentLocations.slice(0, 10).map((loc, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <CheckCircle className="h-2.5 w-2.5 text-chart-1 shrink-0" />
                        <span className="truncate">{loc.city} → {loc.area}</span>
                        <span className="ml-auto text-chart-1 shrink-0">+{loc.types_created}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
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

                  {actualRemainingProvinces.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-chart-3 mb-1.5 uppercase tracking-wider">
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

                  {allCompletedProvinces.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold text-chart-1 uppercase tracking-wider">
                          Completed ({allCompletedProvinces.length})
                        </p>
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="text-[9px] text-primary hover:underline"
                        >
                          {showHistory ? "Hide details" : "Show details"}
                        </button>
                      </div>
                      <ScrollArea className="max-h-48">
                        <div className="grid grid-cols-1 gap-1">
                          {allCompletedProvinces.map(p => {
                            const rec = getDoneRecord(p);
                            return (
                              <div key={p} className="rounded-md border border-chart-1/20 bg-chart-1/5 px-2 py-1.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-chart-1">
                                  <CheckCircle className="h-3 w-3 shrink-0" />
                                  <span className="font-medium truncate">{p}</span>
                                  <span className="ml-auto text-[9px] text-chart-1/60 shrink-0">
                                    {provincePropertyCounts[p] || rec?.created || "✓"} props
                                  </span>
                                </div>
                                {showHistory && rec && (
                                  <div className="mt-1 pl-4.5 space-y-0.5">
                                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                      <Clock className="h-2.5 w-2.5" />
                                      <span>{formatTime(rec.completedAt)}</span>
                                    </div>
                                    <div className="text-[9px] text-muted-foreground">
                                      +{rec.created} created, {rec.skipped} skipped, {rec.errors} errors
                                    </div>
                                    {rec.cities.length > 0 && (
                                      <div className="text-[9px] text-muted-foreground">
                                        <span className="font-medium">Cities:</span> {rec.cities.slice(0, 5).join(", ")}
                                        {rec.cities.length > 5 && ` +${rec.cities.length - 5} more`}
                                      </div>
                                    )}
                                    {rec.areas.length > 0 && (
                                      <div className="text-[9px] text-muted-foreground">
                                        <span className="font-medium">Areas:</span> {rec.areas.slice(0, 8).join(", ")}
                                        {rec.areas.length > 8 && ` +${rec.areas.length - 8} more`}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
                <Button className="flex-1 gap-2 h-9 text-sm" onClick={handleSmartRun}>
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
            Pick a specific province to generate individually.
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
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover border border-border shadow-lg z-[200]" align="start" sideOffset={4}>
              <Command>
                <CommandInput placeholder="Search province..." />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No province found.</CommandEmpty>
                  {actualRemainingProvinces.length > 0 && (
                    <CommandGroup heading={`Remaining (${actualRemainingProvinces.length})`}>
                      {actualRemainingProvinces.map((p) => (
                        <CommandItem key={p} value={p} onSelect={() => handleProvinceSelect(p)} className="text-sm">
                          <Check className={cn("mr-2 h-3.5 w-3.5", selectedProvince === p ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1">{p}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-chart-3/30 text-chart-3 ml-2">new</Badge>
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
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-chart-1/30 text-chart-1 ml-2">
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
                <p className="text-lg font-bold text-chart-3">{existingCount}</p>
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
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-chart-3/10 border border-chart-3/20">
              <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
              <p className="text-[11px] text-chart-3 leading-relaxed">
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

      {/* Single province live progress */}
      {isRunning && !isAutoMode && (
        <Card>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium">
                  Processing kelurahan {progress.processed}/{progress.total}...
                </span>
              </div>
              <Badge variant="outline" className="text-[9px] gap-1 h-5">
                <Clock className="h-3 w-3" />
                {formatDuration(elapsedTime)}
              </Badge>
            </div>

            {/* Live city/area */}
            {(liveCity || liveArea) && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded px-2 py-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  {liveCity && <span className="font-medium text-foreground">{liveCity}</span>}
                  {liveArea && <span> → <span className="font-medium text-foreground">{liveArea}</span></span>}
                </span>
                {provinceCitiesDone.length > 0 && (
                  <span className="ml-auto text-[9px]">{provinceCitiesDone.length} cities, {provinceAreasDone.length} areas</span>
                )}
              </div>
            )}

            <Progress value={progressPercent} className="h-2" />
            {progress.existingCount > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-chart-3/5 rounded px-2 py-1 border border-chart-3/10">
                <Building2 className="h-3 w-3 text-chart-3 shrink-0" />
                <span>Existing: <span className="font-bold text-chart-3">{progress.existingCount.toLocaleString()}</span></span>
                <span className="ml-auto">Target remaining: <span className="font-bold text-primary">{Math.max(0, (progress.total * PROPERTY_TYPES.length) - progress.existingCount - progress.created).toLocaleString()}</span></span>
              </div>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="text-chart-1">✓ {progress.created} created</span>
              <span className="text-chart-3">⊘ {progress.skipped} skipped</span>
              <span className="text-destructive">✗ {progress.errors} errors</span>
            </div>

            {/* Recent locations */}
            {recentLocations.length > 0 && (
              <ScrollArea className="max-h-20 rounded border bg-muted/20 p-2">
                <div className="space-y-0.5">
                  {recentLocations.slice(0, 8).map((loc, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <CheckCircle className="h-2.5 w-2.5 text-chart-1 shrink-0" />
                      <span className="truncate">{loc.city} → {loc.area}</span>
                      <span className="ml-auto text-chart-1 shrink-0">+{loc.types_created}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && !isRunning && (
        <Card className="border-chart-1/30 bg-chart-1/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 text-chart-1 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-chart-1">
                    {result.allDone ? "🎉 All Provinces Complete!" : `Generation Complete${result.province ? ` — ${result.province}` : ""}!`}
                  </h3>
                  {elapsedTime > 0 && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(elapsedTime)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-md bg-background/50">
                    <p className="text-base font-bold text-chart-1">{result.created}</p>
                    <p className="text-[10px] text-muted-foreground">Created</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-background/50">
                    <p className="text-base font-bold text-chart-3">{result.skipped}</p>
                    <p className="text-[10px] text-muted-foreground">Skipped</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-background/50">
                    <p className="text-base font-bold text-destructive">{result.errors}</p>
                    <p className="text-[10px] text-muted-foreground">Errors</p>
                  </div>
                </div>
                {result.cities && result.cities.length > 0 && (
                  <div className="text-[10px] text-muted-foreground">
                    <span className="font-medium">Cities covered:</span> {result.cities.slice(0, 6).join(", ")}
                    {result.cities.length > 6 && ` +${result.cities.length - 6} more`}
                  </div>
                )}
                {result.areas && result.areas.length > 0 && (
                  <div className="text-[10px] text-muted-foreground">
                    <span className="font-medium">Areas:</span> {result.areas.slice(0, 10).join(", ")}
                    {result.areas.length > 10 && ` +${result.areas.length - 10} more`}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SamplePropertyGenerator;
