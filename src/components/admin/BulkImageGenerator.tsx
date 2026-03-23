import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  ImageIcon, Loader2, Play, StopCircle, AlertTriangle, CheckCircle,
  Zap, RefreshCw, RotateCcw, Upload, Server, Clock, TrendingUp
} from "lucide-react";
import {
  useImageQueueStats,
  useRecentImageJobs,
  useEnqueueImages,
  useProcessImages,
  useRetryFailedImages,
} from "@/hooks/useImageGenerationQueue";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function BulkImageGenerator() {
  const [concurrency, setConcurrency] = useState(3);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [batchLimit, setBatchLimit] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: queueStats, isLoading: statsLoading, refetch: refetchStats } = useImageQueueStats();
  const { data: recentJobs } = useRecentImageJobs(15);
  const enqueue = useEnqueueImages();
  const process = useProcessImages();
  const retryFailed = useRetryFailedImages();

  const { data: propertyStats } = useQuery({
    queryKey: ["bulk-image-property-stats"],
    queryFn: async () => {
      const { count: noImages } = await supabase.from("properties").select("id", { count: "exact", head: true }).is("thumbnail_url", null);
      const { count: total } = await supabase.from("properties").select("id", { count: "exact", head: true });
      // Count AI generated via the jobs table instead
      const { count: aiGenerated } = await supabase.from("ai_image_jobs" as any).select("id", { count: "exact", head: true }).eq("status", "done");
      return { noImages: noImages || 0, total: total || 0, aiGenerated: aiGenerated || 0 };
    },
    staleTime: 15_000,
  });

  // Auto-processing loop
  const processOnce = useCallback(async () => {
    if (process.isPending) return;
    try {
      const result = await process.mutateAsync(concurrency);
      if (result?.processed === 0) {
        setIsAutoProcessing(false);
        toast.info("Queue empty — auto-processing stopped");
      }
    } catch {
      // will retry next interval
    }
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

  const handleEnqueue = async () => {
    try {
      const result = await enqueue.mutateAsync(batchLimit);
      toast.success(`Enqueued ${result?.enqueued || 0} properties for image generation`);
    } catch (err: any) {
      toast.error(err?.message || "Enqueue failed");
    }
  };

  const handleProcessOnce = async () => {
    try {
      const result = await process.mutateAsync(concurrency);
      toast.success(`Processed ${result?.succeeded || 0}/${result?.processed || 0} images`);
    } catch (err: any) {
      toast.error(err?.message || "Processing failed");
    }
  };

  const handleRetryFailed = async () => {
    try {
      await retryFailed.mutateAsync();
      toast.success("Failed jobs re-queued for retry");
    } catch (err: any) {
      toast.error(err?.message || "Retry failed");
    }
  };

  const pending = queueStats?.pending || 0;
  const done = queueStats?.done || 0;
  const failed = queueStats?.failed || 0;
  const processing = queueStats?.processing || 0;
  const total = queueStats?.total || 0;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              AI Image Generation Engine
            </CardTitle>
            <CardDescription>
              Server-side queue with parallel processing, smart prompts & retry logic
            </CardDescription>
          </div>
          <Badge variant={isAutoProcessing ? "default" : "secondary"} className="gap-1">
            {isAutoProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Server className="h-3 w-3" />}
            {isAutoProcessing ? "Auto-Processing" : "Idle"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Property Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <p className="text-xl font-bold text-foreground">{propertyStats?.total?.toLocaleString() || "..."}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Properties</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center">
            <p className="text-xl font-bold text-destructive">{propertyStats?.noImages?.toLocaleString() || "..."}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Need Images</p>
          </div>
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-3 text-center">
            <p className="text-xl font-bold text-chart-2">{propertyStats?.aiGenerated?.toLocaleString() || "..."}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Generated</p>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-2 text-center">
            <p className="text-lg font-bold text-chart-1">{pending}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Pending</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-center">
            <p className="text-lg font-bold text-primary">{processing}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Processing</p>
          </div>
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-2 text-center">
            <p className="text-lg font-bold text-chart-2">{done}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Done</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-center">
            <p className="text-lg font-bold text-destructive">{failed}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Failed</p>
          </div>
        </div>

        {total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Queue Progress</span>
              <span>{progressPercent}% complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Concurrency Slider */}
        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Parallel Workers
            </span>
            <Badge variant="outline">{concurrency}</Badge>
          </div>
          <Slider
            value={[concurrency]}
            onValueChange={([v]) => setConcurrency(v)}
            min={1} max={5} step={1}
            className="py-1"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>1 (safe)</span>
            <span>3 (balanced)</span>
            <span>5 (fast)</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleEnqueue} variant="outline" className="gap-1.5" disabled={enqueue.isPending}>
            {enqueue.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Enqueue {batchLimit}
          </Button>

          {!isAutoProcessing ? (
            <>
              <Button onClick={handleProcessOnce} className="gap-1.5" disabled={process.isPending || pending === 0}>
                {process.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                Process Batch
              </Button>
              <Button onClick={() => setIsAutoProcessing(true)} variant="default" className="gap-1.5" disabled={pending === 0}>
                <Play className="h-3.5 w-3.5" />
                Auto-Process
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsAutoProcessing(false)} variant="destructive" className="gap-1.5">
              <StopCircle className="h-3.5 w-3.5" />
              Stop
            </Button>
          )}

          {failed > 0 && (
            <Button onClick={handleRetryFailed} variant="outline" className="gap-1.5" disabled={retryFailed.isPending}>
              <RotateCcw className="h-3.5 w-3.5" />
              Retry {failed} Failed
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => refetchStats()} className="gap-1">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {/* Recent Jobs */}
        {recentJobs && recentJobs.length > 0 && (
          <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border/40 p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Recent Jobs ({recentJobs.length})
            </p>
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-2 text-[11px] py-0.5">
                <span className={
                  job.status === "done" ? "text-chart-2" :
                  job.status === "failed" ? "text-destructive" :
                  job.status === "processing" ? "text-primary" : "text-muted-foreground"
                }>
                  {job.status === "done" ? "✓" : job.status === "failed" ? "✗" : job.status === "processing" ? "⟳" : "◯"}
                </span>
                <span className="text-foreground truncate flex-1 font-mono text-[10px]">{job.property_id.slice(0, 12)}…</span>
                <Badge variant="outline" className="text-[9px] py-0 h-4">
                  P:{job.priority_score}
                </Badge>
                {job.retry_count > 0 && (
                  <span className="text-chart-1 text-[9px]">R:{job.retry_count}</span>
                )}
                {job.error_message && (
                  <span className="text-destructive truncate max-w-[100px] text-[9px]">{job.error_message}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Architecture Info */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-primary" />
            Architecture Details
          </summary>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li><strong>Server-side queue</strong> — jobs persist in <code>ai_image_jobs</code> table, runs even if browser closes</li>
            <li><strong>Parallel processing</strong> — up to 5 concurrent workers per batch</li>
            <li><strong>Smart prompts</strong> — price-tier styling (luxury/mid/budget), size context, city-specific</li>
            <li><strong>Retry + backoff</strong> — 3 retries with exponential backoff, rate-limit aware</li>
            <li><strong>Deduplication</strong> — unique constraint prevents duplicate jobs per property</li>
            <li><strong>Priority scoring</strong> — higher-priced listings generated first</li>
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
