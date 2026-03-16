import React, { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageIcon, Loader2, Play, StopCircle, AlertTriangle, CheckCircle, Zap, RefreshCw } from "lucide-react";

const BATCH_SIZE = 10;

export default function BulkImageGenerator() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [succeeded, setSucceeded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [currentProperty, setCurrentProperty] = useState("");
  const [currentBatch, setCurrentBatch] = useState(0);
  const cancelRef = useRef(false);
  const [offset, setOffset] = useState(0);

  // Count properties without images
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["bulk-image-stats"],
    queryFn: async () => {
      // Properties with no images and no thumbnail
      const { count: noImages } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .or("images.is.null,thumbnail_url.is.null");

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
    let currentOffset = offset;
    let batchNum = currentBatch;

    while (!cancelRef.current) {
      try {
        // 1. Fetch batch of properties without images
        const { data: properties, error: fetchErr } = await supabase
          .from("properties")
          .select("id, title, property_type, city, location, description")
          .is("thumbnail_url", null)
          .order("created_at", { ascending: false })
          .range(currentOffset, currentOffset + BATCH_SIZE - 1);

        if (fetchErr) {
          toast.error(`Fetch error: ${fetchErr.message}`);
          break;
        }

        if (!properties || properties.length === 0) {
          toast.success("🎉 No more properties without images in this range!");
          break;
        }

        batchNum++;
        setCurrentBatch(batchNum);

        // 2. Process each property — call ai-engine generate_image
        for (let i = 0; i < properties.length; i++) {
          if (cancelRef.current) break;

          const prop = properties[i];
          setCurrentProperty(`${prop.title?.slice(0, 60)}...`);
          setProcessed(prev => prev + 1);

          try {
            const { data, error } = await supabase.functions.invoke("ai-engine", {
              body: {
                mode: "generate_image",
                payload: {
                  propertyId: prop.id,
                  title: prop.title,
                  description: prop.description?.slice(0, 200),
                  propertyType: prop.property_type,
                  location: prop.location || prop.city,
                },
              },
            });

            if (error) {
              console.error(`Image gen failed for ${prop.id}:`, error);
              setFailed(prev => prev + 1);
            } else if (data?.error) {
              console.error(`AI error for ${prop.id}:`, data.error);
              setFailed(prev => prev + 1);
            } else {
              setSucceeded(prev => prev + 1);
            }
          } catch (err: any) {
            console.error(`Exception for ${prop.id}:`, err);
            setFailed(prev => prev + 1);
          }

          // Rate limit: 1.5s between each image
          if (i < properties.length - 1 && !cancelRef.current) {
            await new Promise(r => setTimeout(r, 1500));
          }
        }

        // Move to next batch
        currentOffset += BATCH_SIZE;
        setOffset(currentOffset);

        // 3s delay between batches
        if (!cancelRef.current) {
          await new Promise(r => setTimeout(r, 3000));
        }
      } catch (err: any) {
        console.error("Bulk gen error:", err);
        toast.error(err.message || "Unknown error");
        break;
      }
    }

    setIsRunning(false);
    setCurrentProperty("");
    refetchStats();
    queryClient.invalidateQueries({ queryKey: ["bulk-image-stats"] });
  }, [offset, currentBatch, refetchStats, queryClient]);

  const stopGeneration = () => {
    cancelRef.current = true;
    toast.info("Stopping after current image completes...");
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
              Generate AI images for properties without photos using Lovable AI (Gemini Flash Image)
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

        {/* Live Progress */}
        {(isRunning || processed > 0) && (
          <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Session Progress</span>
              <span className="font-semibold text-foreground">
                Batch #{currentBatch}
              </span>
            </div>

            <Progress value={progressPercent} className="h-2.5" />

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{processed}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Processed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-chart-2">{succeeded}</p>
                <p className="text-[10px] text-chart-2 uppercase tracking-wider">✓ Generated</p>
              </div>
              <div>
                <p className="text-lg font-bold text-destructive">{failed}</p>
                <p className="text-[10px] text-destructive uppercase tracking-wider">✗ Failed</p>
              </div>
            </div>

            {currentProperty && isRunning && (
              <div className="flex items-center gap-2 pt-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                <p className="text-xs text-muted-foreground truncate">
                  Generating: {currentProperty}
                </p>
              </div>
            )}

            {/* Estimated time */}
            {isRunning && stats?.noImages && succeeded > 0 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                ~{Math.round(((stats.noImages - succeeded) * 2.5) / 60)} minutes remaining at current pace
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
            <li>Processes {BATCH_SIZE} properties per batch with 1.5s delay between each image</li>
            <li>Images are uploaded to <strong>property-images</strong> storage bucket and linked to the property</li>
            <li>You can stop and resume anytime — it picks up from the last offset ({offset})</li>
            <li>For large volumes, run over multiple sessions. Rate limits may apply.</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isRunning ? (
            <Button onClick={runBulkGeneration} className="gap-2" disabled={statsLoading}>
              <Play className="h-4 w-4" />
              {offset > 0 ? `Resume (offset: ${offset})` : "Start Bulk Generation"}
            </Button>
          ) : (
            <Button onClick={stopGeneration} variant="destructive" className="gap-2">
              <StopCircle className="h-4 w-4" />
              Stop
            </Button>
          )}

          {offset > 0 && !isRunning && (
            <Button
              variant="outline"
              onClick={() => {
                setOffset(0);
                setProcessed(0);
                setSucceeded(0);
                setFailed(0);
                setCurrentBatch(0);
              }}
            >
              Reset Offset
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => refetchStats()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Stats
          </Button>
        </div>

        {/* Results summary */}
        {!isRunning && succeeded > 0 && (
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-chart-2 shrink-0" />
            <p className="text-sm text-foreground">
              Session complete: <strong>{succeeded}</strong> images generated, <strong>{failed}</strong> failed out of <strong>{processed}</strong> processed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
