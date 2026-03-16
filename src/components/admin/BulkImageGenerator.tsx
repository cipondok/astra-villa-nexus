import React, { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageIcon, Loader2, Play, StopCircle, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const BATCH_SIZE = 10;
const CONCURRENCY = 2;

export default function BulkImageGenerator() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [succeeded, setSucceeded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [currentProperty, setCurrentProperty] = useState("");
  const cancelRef = useRef(false);
  const [totalOffset, setTotalOffset] = useState(0);

  // Count properties without images
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["bulk-image-stats"],
    queryFn: async () => {
      const { count: noImages } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .or("images.is.null,images.eq.{}")
        .is("thumbnail_url", null);

      const { count: total } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true });

      return {
        noImages: noImages || 0,
        total: total || 0,
        withImages: (total || 0) - (noImages || 0),
      };
    },
    staleTime: 30_000,
  });

  const runBulkGeneration = useCallback(async () => {
    cancelRef.current = false;
    setIsRunning(true);
    setProcessed(0);
    setSucceeded(0);
    setFailed(0);
    let offset = totalOffset;
    let batchEmpty = false;

    while (!cancelRef.current && !batchEmpty) {
      try {
        const { data, error } = await supabase.functions.invoke("job-worker", {
          body: {
            mode: "bulk_generate_images",
            batchSize: BATCH_SIZE,
            offset,
          },
        });

        if (error) {
          console.error("Bulk image error:", error);
          toast.error(`Batch error: ${error.message}`);
          setFailed(prev => prev + 1);
          // Continue to next offset
          offset += BATCH_SIZE;
          continue;
        }

        if (!data || data.processed === 0) {
          batchEmpty = true;
          toast.success("No more properties without images in this range!");
          break;
        }

        setProcessed(prev => prev + (data.total || 0));
        setSucceeded(prev => prev + (data.processed || 0));
        setFailed(prev => prev + ((data.total || 0) - (data.processed || 0)));
        setCurrentProperty(`Batch at offset ${offset}`);
        offset = data.offset + BATCH_SIZE;
        setTotalOffset(offset);

        // Rate limit pause between batches
        await new Promise(r => setTimeout(r, 3000));
      } catch (err: any) {
        console.error("Bulk gen error:", err);
        toast.error(err.message || "Unknown error");
        break;
      }
    }

    setIsRunning(false);
    refetchStats();
    queryClient.invalidateQueries({ queryKey: ["bulk-image-stats"] });
  }, [totalOffset, refetchStats, queryClient]);

  const stopGeneration = () => {
    cancelRef.current = true;
    setIsRunning(false);
    toast.info("Stopping after current batch completes...");
  };

  const progressPercent = stats?.noImages
    ? Math.min(100, (succeeded / Math.max(1, stats.noImages)) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Bulk AI Image Generator
            </CardTitle>
            <CardDescription>
              Generate AI images for properties that have no photos using Lovable AI (Gemini Flash Image)
            </CardDescription>
          </div>
          <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
            {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
            {isRunning ? "Running" : "Idle"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.total?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Properties</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="text-2xl font-bold text-destructive">
              {statsLoading ? "..." : stats?.noImages?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">No Images</p>
          </div>
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-4 text-center">
            <p className="text-2xl font-bold text-chart-2">
              {statsLoading ? "..." : stats?.withImages?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">With Images</p>
          </div>
        </div>

        {/* Progress */}
        {(isRunning || processed > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Session Progress</span>
              <span className="font-medium text-foreground">
                {succeeded} generated / {failed} failed / {processed} processed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {currentProperty && (
              <p className="text-xs text-muted-foreground truncate">
                Current: {currentProperty}
              </p>
            )}
          </div>
        )}

        {/* Info box */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-1" />
            How it works
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Uses <strong>Lovable AI Gateway</strong> → google/gemini-2.5-flash-image to generate professional property photos</li>
            <li>Processes {BATCH_SIZE} properties per batch, {CONCURRENCY} concurrent image generations</li>
            <li>Images are uploaded to <strong>property-images</strong> storage bucket and linked to the property</li>
            <li>Rate-limited with 3-second delays between batches to avoid API limits</li>
            <li>You can stop and resume anytime — it picks up from the last offset</li>
            <li>For 313K properties at ~10/batch: this will take many hours. Run in background sessions.</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <Button onClick={runBulkGeneration} className="gap-2" disabled={statsLoading}>
              <Play className="h-4 w-4" />
              {totalOffset > 0 ? `Resume (offset: ${totalOffset})` : "Start Bulk Generation"}
            </Button>
          ) : (
            <Button onClick={stopGeneration} variant="destructive" className="gap-2">
              <StopCircle className="h-4 w-4" />
              Stop
            </Button>
          )}

          {totalOffset > 0 && !isRunning && (
            <Button
              variant="outline"
              onClick={() => {
                setTotalOffset(0);
                setProcessed(0);
                setSucceeded(0);
                setFailed(0);
              }}
            >
              Reset Offset
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => refetchStats()}>
            Refresh Stats
          </Button>
        </div>

        {/* Results summary */}
        {!isRunning && succeeded > 0 && (
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-chart-2 shrink-0" />
            <p className="text-sm text-foreground">
              Session complete: <strong>{succeeded}</strong> images generated, <strong>{failed}</strong> failed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
