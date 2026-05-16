import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ImageIcon, Loader2, Play, StopCircle,
  RefreshCw, RotateCcw, Upload, Server, TrendingUp,
  Eye, Heart, MessageSquare, Shield, BarChart3, Settings2, Camera, Sparkles, MapPin
} from "lucide-react";
import {
  useImageQueueStats,
  useRecentImageJobs,
  useEnqueueImages,
  useEnqueueLandVisions,
  useProcessImages,
  useRetryFailedImages,
  useReprioritizeJobs,
  useUpdateImageGenConfig,
  ANGLE_LABELS,
} from "@/hooks/useImageGenerationQueue";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function BulkImageGenerator() {
  const [concurrency, setConcurrency] = useState(3);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: queueStats, refetch: refetchStats } = useImageQueueStats();
  const { data: recentJobs } = useRecentImageJobs(20);
  const enqueue = useEnqueueImages();
  const enqueueLand = useEnqueueLandVisions();
  const process = useProcessImages();
  const retryFailed = useRetryFailedImages();
  const reprioritize = useReprioritizeJobs();
  const updateConfig = useUpdateImageGenConfig();

  const { data: propertyStats } = useQuery({
    queryKey: ["bulk-image-property-stats"],
    queryFn: async () => {
      const { count: noImages } = await supabase.from("properties").select("id", { count: "exact", head: true }).is("thumbnail_url", null);
      const { count: total } = await supabase.from("properties").select("id", { count: "exact", head: true });
      const { count: aiGenerated } = await supabase.from("ai_image_jobs" as any).select("id", { count: "exact", head: true }).eq("status", "done");
      return { noImages: noImages || 0, total: total || 0, aiGenerated: aiGenerated || 0 };
    },
    staleTime: 15_000,
  });

  const processOnce = useCallback(async () => {
    if (process.isPending) return;
    try {
      const result = await process.mutateAsync(concurrency);
      if (result?.processed === 0 || result?.budget_remaining === 0) {
        setIsAutoProcessing(false);
        toast.info(result?.budget_remaining === 0 ? "Daily budget exhausted" : "Queue empty");
      }
    } catch { /* retry next interval */ }
  }, [concurrency, process]);

  useEffect(() => {
    if (isAutoProcessing) {
      processOnce();
      intervalRef.current = setInterval(processOnce, 8000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoProcessing, processOnce]);

  const pending = queueStats?.pending || 0;
  const done = queueStats?.done || 0;
  const failed = queueStats?.failed || 0;
  const processing = queueStats?.processing || 0;
  const total = queueStats?.total || 0;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;
  const budgetUsed = queueStats?.budget?.used_today || 0;
  const budgetLimit = queueStats?.budget?.daily_limit || 200;
  const budgetPercent = Math.round((budgetUsed / budgetLimit) * 100);

  const intentColor = (intent: string) => {
    switch (intent) {
      case "luxury": return "text-chart-1";
      case "investment": return "text-chart-2";
      case "family": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const angleInfo = (type: string) => ANGLE_LABELS[type] || { label: type, icon: "📷" };

  // Count vision renders in stats
  const visionDone = (queueStats?.angles?.vision_future_concept?.done || 0) + (queueStats?.angles?.vision_aerial_concept?.done || 0);
  const visionPending = (queueStats?.angles?.vision_future_concept?.pending || 0) + (queueStats?.angles?.vision_aerial_concept?.pending || 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              AI Image & Vision Engine
            </CardTitle>
            <CardDescription>
              Multi-angle • Land vision renders • Traffic-aware priority
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isAutoProcessing ? "default" : "secondary"} className="gap-1">
              {isAutoProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Server className="h-3 w-3" />}
              {isAutoProcessing ? "Auto" : "Idle"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowConfig(!showConfig)}>
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{propertyStats?.noImages?.toLocaleString() || "…"}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Need Images</p>
          </div>
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-2.5 text-center">
            <p className="text-lg font-bold text-chart-2">{propertyStats?.aiGenerated?.toLocaleString() || "…"}</p>
            <p className="text-[9px] text-muted-foreground uppercase">AI Generated</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-center">
            <p className="text-lg font-bold text-primary">{pending}</p>
            <p className="text-[9px] text-muted-foreground uppercase">In Queue</p>
          </div>
          <div className="rounded-lg border border-chart-4/20 bg-chart-4/5 p-2.5 text-center">
            <p className="text-lg font-bold text-chart-4">{visionDone}</p>
            <p className="text-[9px] text-muted-foreground uppercase flex items-center justify-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> Land Visions
            </p>
          </div>
          <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-2.5 text-center">
            <p className="text-lg font-bold text-chart-1">{budgetUsed}/{budgetLimit}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Budget</p>
          </div>
        </div>

        {/* Angle Breakdown */}
        {queueStats?.angles && Object.keys(queueStats.angles).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(queueStats.angles).map(([angle, counts]) => {
              const info = angleInfo(angle);
              const isVision = angle.startsWith("vision_");
              return (
                <div key={angle} className={`flex items-center gap-1 rounded-md border px-2 py-1 ${isVision ? "border-chart-4/30 bg-chart-4/5" : "border-border/40 bg-muted/20"}`}>
                  <span className="text-xs">{info.icon}</span>
                  <span className="text-[9px] font-medium text-foreground">{info.label}</span>
                  <Badge variant="outline" className="text-[8px] py-0 h-3.5 px-1">
                    {counts.done}✓ {counts.pending}◯
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Budget + Queue Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Daily Budget</span>
            <span>{budgetPercent}% used</span>
          </div>
          <Progress value={budgetPercent} className="h-1.5" />
        </div>

        {total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Queue</span>
              <span>{done} done • {failed} failed • {processing} active</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Config Panel */}
        {showConfig && (
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-3">
            <p className="text-xs font-semibold text-foreground">Generation Config</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px]">Max Per Property</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[queueStats?.config?.max_per_property || 5]} min={1} max={7} step={1}
                    onValueChange={([v]) => updateConfig.mutate({ max_images_per_property: v })} />
                  <span className="text-xs font-mono w-4">{queueStats?.config?.max_per_property || 5}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Min Traffic (Main)</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[queueStats?.config?.min_traffic || 5]} min={0} max={20} step={1}
                    onValueChange={([v]) => updateConfig.mutate({ min_traffic_threshold: v })} />
                  <span className="text-xs font-mono w-4">{queueStats?.config?.min_traffic || 5}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Extra Angles Min Traffic</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[queueStats?.config?.extra_angles_min_traffic || 15]} min={5} max={50} step={5}
                    onValueChange={([v]) => updateConfig.mutate({ extra_angles_min_traffic: v })} />
                  <span className="text-xs font-mono w-6">{queueStats?.config?.extra_angles_min_traffic || 15}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Extra Angles Min Price (B)</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[(queueStats?.config?.extra_angles_min_price || 1_000_000_000) / 1_000_000_000]} min={0.5} max={10} step={0.5}
                    onValueChange={([v]) => updateConfig.mutate({ extra_angles_min_price: v * 1_000_000_000 })} />
                  <span className="text-xs font-mono w-6">{((queueStats?.config?.extra_angles_min_price || 1_000_000_000) / 1_000_000_000).toFixed(1)}B</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={queueStats?.config?.auto_enqueue || false}
                onCheckedChange={(v) => updateConfig.mutate({ auto_enqueue_enabled: v })} />
              <Label className="text-xs">Auto-enqueue high-traffic listings</Label>
            </div>
          </div>
        )}

        {/* Concurrency */}
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-2.5">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Slider value={[concurrency]} onValueChange={([v]) => setConcurrency(v)} min={1} max={5} step={1} className="flex-1" />
          <Badge variant="outline" className="text-[10px] shrink-0">{concurrency}x</Badge>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1 text-xs" disabled={enqueue.isPending}
            onClick={async () => {
              try {
                const r = await enqueue.mutateAsync({ limit: 100 });
                toast.success(`Enqueued ${r?.enqueued || 0} (${r?.land_enqueued || 0} land visions)`);
              } catch (e: any) { toast.error(e?.message); }
            }}>
            {enqueue.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            Enqueue All
          </Button>

          <Button size="sm" variant="outline" className="gap-1 text-xs border-chart-4/30 text-chart-4 hover:bg-chart-4/10" disabled={enqueueLand.isPending}
            onClick={async () => {
              try {
                const r = await enqueueLand.mutateAsync({ limit: 50 });
                toast.success(`${r?.enqueued || 0} land vision renders queued (${r?.total_land || 0} land listings found)`);
              } catch (e: any) { toast.error(e?.message); }
            }}>
            {enqueueLand.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Land Visions
          </Button>

          <Button size="sm" variant="outline" className="gap-1 text-xs" disabled={reprioritize.isPending}
            onClick={async () => {
              try {
                const r = await reprioritize.mutateAsync();
                toast.success(`Reprioritized ${r?.updated || 0} jobs`);
              } catch (e: any) { toast.error(e?.message); }
            }}>
            {reprioritize.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
            Reprioritize
          </Button>

          {!isAutoProcessing ? (
            <Button size="sm" className="gap-1 text-xs" disabled={pending === 0}
              onClick={() => setIsAutoProcessing(true)}>
              <Play className="h-3 w-3" /> Auto-Process
            </Button>
          ) : (
            <Button size="sm" variant="destructive" className="gap-1 text-xs"
              onClick={() => setIsAutoProcessing(false)}>
              <StopCircle className="h-3 w-3" /> Stop
            </Button>
          )}

          {failed > 0 && (
            <Button size="sm" variant="outline" className="gap-1 text-xs" disabled={retryFailed.isPending}
              onClick={async () => { await retryFailed.mutateAsync(); toast.success("Failed jobs requeued"); }}>
              <RotateCcw className="h-3 w-3" /> Retry {failed}
            </Button>
          )}

          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={() => refetchStats()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {/* Recent Jobs */}
        {recentJobs && recentJobs.length > 0 && (
          <div className="space-y-1 max-h-60 overflow-y-auto rounded-lg border border-border/40 p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Recent Jobs ({recentJobs.length})
            </p>
            {recentJobs.map((job) => {
              const angle = angleInfo(job.angle_type);
              const isVision = job.angle_type?.startsWith("vision_");
              return (
                <div key={job.id} className="flex items-center gap-1.5 text-[10px] py-0.5">
                  <span className={
                    job.status === "done" ? "text-chart-2" :
                    job.status === "failed" ? "text-destructive" :
                    job.status === "processing" ? "text-primary" : "text-muted-foreground"
                  }>
                    {job.status === "done" ? "✓" : job.status === "failed" ? "✗" : job.status === "processing" ? "⟳" : "◯"}
                  </span>
                  <span className="text-foreground truncate font-mono text-[9px] w-16">{job.property_id.slice(0, 10)}…</span>
                  <span className="text-[9px]" title={job.angle_type}>{angle.icon}</span>
                  <Badge variant={isVision ? "default" : "outline"} className={`text-[8px] py-0 h-3.5 px-1 ${isVision ? "bg-chart-4/20 text-chart-4 border-chart-4/30" : ""}`}>
                    {angle.label}
                  </Badge>
                  <Badge variant="outline" className="text-[8px] py-0 h-3.5 px-1">P:{job.priority_score}</Badge>
                  <span className="flex items-center gap-0.5 text-muted-foreground">
                    <Eye className="h-2.5 w-2.5" />{job.traffic_views || 0}
                  </span>
                  <span className="flex items-center gap-0.5 text-muted-foreground">
                    <Heart className="h-2.5 w-2.5" />{job.traffic_saves || 0}
                  </span>
                  <span className={`text-[8px] ${intentColor(job.traffic_intent)}`}>
                    {job.traffic_intent}
                  </span>
                  {job.error_message && (
                    <span className="text-destructive truncate max-w-[70px] text-[8px] ml-auto">{job.error_message}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Architecture Info */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-primary" /> System Architecture
          </summary>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li><strong>Buildings</strong> — 5 angles (Front, Side, Aerial, Lifestyle, Evening)</li>
            <li><strong>Land listings</strong> — Auto-detected → Future Vision + Aerial Vision concept renders</li>
            <li><strong>Vision intelligence</strong> — Style adapts by land size, price, city context (tourism vs suburban)</li>
            <li><strong>Staged generation</strong> — Main first, extras cascade for high-traffic/premium properties</li>
            <li><strong>Terrain detection</strong> — Prompts adapt for hillside, beachfront, rice field, riverside</li>
            <li><strong>Cost control</strong> — Daily budget, cooldown, max per property, engagement threshold</li>
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
