import React, { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageIcon, Loader2, Play, StopCircle, AlertTriangle, CheckCircle, Zap, RefreshCw } from "lucide-react";

const BATCH_SIZE = 5;
const DELAY_BETWEEN_IMAGES = 2000;
const DELAY_BETWEEN_BATCHES = 4000;

export default function BulkImageGenerator() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [succeeded, setSucceeded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [currentProperty, setCurrentProperty] = useState("");
  const [currentBatch, setCurrentBatch] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [log, setLog] = useState<{ id: string; title: string; status: "ok" | "fail"; msg?: string }[]>([]);
  const cancelRef = useRef(false);
  const [offset, setOffset] = useState(0);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["bulk-image-stats"],
    queryFn: async () => {
      const { count: noImages } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
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

  const addLog = useCallback((entry: { id: string; title: string; status: "ok" | "fail"; msg?: string }) => {
    setLog(prev => [entry, ...prev].slice(0, 50));
  }, []);

  const runBulkGeneration = useCallback(async () => {
    cancelRef.current = false;
    setIsRunning(true);
    setLastError(null);
    let currentOffset = offset;
    let batchNum = currentBatch;

    while (!cancelRef.current) {
      try {
        const { data: properties, error: fetchErr } = await supabase
          .from("properties")
          .select("id, title, property_type, city, location, description")
          .is("thumbnail_url", null)
          .order("created_at", { ascending: false })
          .range(currentOffset, currentOffset + BATCH_SIZE - 1);

        if (fetchErr) {
          setLastError(`Fetch error: ${fetchErr.message}`);
          toast.error(`Fetch error: ${fetchErr.message}`);
          break;
        }

        if (!properties || properties.length === 0) {
          toast.success("🎉 No more properties without images!");
          break;
        }

        batchNum++;
        setCurrentBatch(batchNum);

        for (let i = 0; i < properties.length; i++) {
          if (cancelRef.current) break;

          const prop = properties[i];
          const shortTitle = prop.title?.slice(0, 50) || `Property ${prop.id.slice(0, 8)}`;
          setCurrentProperty(shortTitle);
          setProcessed(prev => prev + 1);

          try {
            const { data, error } = await supabase.functions.invoke("ai-engine", {
              body: {
                mode: "generate_image",
                payload: {
                  propertyId: prop.id,
                  title: prop.title || "Property",
                  description: prop.description?.slice(0, 200),
                  propertyType: prop.property_type || "house",
                  location: prop.location || prop.city || "Indonesia",
                },
              },
            });

            if (error) {
              const errMsg = error.message || "Edge Function error";
              console.error(`Image gen failed for ${prop.id}:`, errMsg);
              setFailed(prev => prev + 1);
              setLastError(errMsg);
              addLog({ id: prop.id, title: shortTitle, status: "fail", msg: errMsg });
            } else if (data?.error) {
              console.error(`AI error for ${prop.id}:`, data.error);
              setFailed(prev => prev + 1);
              setLastError(data.error);
              addLog({ id: prop.id, title: shortTitle, status: "fail", msg: data.error });
            } else {
              setSucceeded(prev => prev + 1);
              setLastError(null);
              addLog({ id: prop.id, title: shortTitle, status: "ok", msg: data?.newImageUrl?.slice(-30) });
            }
          } catch (err: any) {
            const errMsg = err?.message || "Network error";
            console.error(`Exception for ${prop.id}:`, err);
            setFailed(prev => prev + 1);
            setLastError(errMsg);
            addLog({ id: prop.id, title: shortTitle, status: "fail", msg: errMsg });
          }

          // Rate limit
          if (i < properties.length - 1 && !cancelRef.current) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_IMAGES));
          }
        }

        currentOffset += BATCH_SIZE;
        setOffset(currentOffset);

        if (!cancelRef.current) {
          await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
        }
      } catch (err: any) {
        const errMsg = err?.message || "Unknown error";
        setLastError(errMsg);
        toast.error(errMsg);
        break;
      }
    }

    setIsRunning(false);
    setCurrentProperty("");
    refetchStats();
    queryClient.invalidateQueries({ queryKey: ["bulk-image-stats"] });
  }, [offset, currentBatch, refetchStats, queryClient, addLog]);

  const stopGeneration = () => {
    cancelRef.current = true;
    toast.info("Stopping after current image...");
  };

  const resetAll = () => {
    setOffset(0);
    setProcessed(0);
    setSucceeded(0);
    setFailed(0);
    setCurrentBatch(0);
    setLastError(null);
    setLog([]);
  };

  const progressPercent = stats?.noImages
    ? Math.min(100, (succeeded / Math.max(1, stats.noImages)) * 100)
    : 0;

  const etaMinutes = isRunning && succeeded > 0 && stats?.noImages
    ? Math.round(((stats.noImages - succeeded) * (DELAY_BETWEEN_IMAGES / 1000 + 1.5)) / 60)
    : null;

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
              Generate AI property photos via Lovable AI Gateway (Gemini Flash Image)
            </CardDescription>
          </div>
          <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
            {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
            {isRunning ? "Running" : "Idle"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <p className="text-xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.total?.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center">
            <p className="text-xl font-bold text-destructive">
              {statsLoading ? "..." : stats?.noImages?.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">No Image</p>
          </div>
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-3 text-center">
            <p className="text-xl font-bold text-chart-2">
              {statsLoading ? "..." : stats?.withImages?.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Has Image</p>
          </div>
        </div>

        {/* Live Progress */}
        {(isRunning || processed > 0) && (
          <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Session Progress</span>
              <span className="font-semibold text-foreground">Batch #{currentBatch}</span>
            </div>

            <Progress value={progressPercent} className="h-2.5" />

            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{processed}</p>
                <p className="text-[9px] text-muted-foreground uppercase">Processed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-chart-2">{succeeded}</p>
                <p className="text-[9px] text-chart-2 uppercase">✓ OK</p>
              </div>
              <div>
                <p className="text-lg font-bold text-destructive">{failed}</p>
                <p className="text-[9px] text-destructive uppercase">✗ Fail</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{offset}</p>
                <p className="text-[9px] text-muted-foreground uppercase">Offset</p>
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

            {etaMinutes !== null && (
              <p className="text-[10px] text-muted-foreground text-center">
                ~{etaMinutes} min remaining at current pace
              </p>
            )}
          </div>
        )}

        {/* Last error */}
        {lastError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-destructive">Last Error</p>
              <p className="text-xs text-muted-foreground mt-0.5 break-all">{lastError}</p>
            </div>
          </div>
        )}

        {/* Recent activity log */}
        {log.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg border border-border/40 p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Recent Activity ({log.length})
            </p>
            {log.map((entry, i) => (
              <div key={`${entry.id}-${i}`} className="flex items-center gap-2 text-[11px] py-0.5">
                <span className={entry.status === "ok" ? "text-chart-2" : "text-destructive"}>
                  {entry.status === "ok" ? "✓" : "✗"}
                </span>
                <span className="text-foreground truncate flex-1">{entry.title}</span>
                {entry.msg && (
                  <span className="text-muted-foreground truncate max-w-[120px]">{entry.msg}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isRunning ? (
            <Button onClick={runBulkGeneration} className="gap-2" disabled={statsLoading}>
              <Play className="h-4 w-4" />
              {offset > 0 ? `Resume (offset: ${offset})` : "Start Generation"}
            </Button>
          ) : (
            <Button onClick={stopGeneration} variant="destructive" className="gap-2">
              <StopCircle className="h-4 w-4" />
              Stop
            </Button>
          )}

          {offset > 0 && !isRunning && (
            <Button variant="outline" onClick={resetAll}>
              Reset
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => refetchStats()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Completion summary */}
        {!isRunning && succeeded > 0 && (
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-chart-2 shrink-0" />
            <p className="text-sm text-foreground">
              <strong>{succeeded}</strong> generated, <strong>{failed}</strong> failed of <strong>{processed}</strong> processed.
            </p>
          </div>
        )}

        {/* How it works */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-chart-1" />
            How it works
          </summary>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Calls <code>ai-engine</code> → <code>generate_image</code> mode using Lovable AI Gateway (Gemini Flash Image)</li>
            <li>Processes {BATCH_SIZE} properties per batch with {DELAY_BETWEEN_IMAGES / 1000}s delay between images</li>
            <li>Images uploaded to <code>property-images</code> bucket and linked to the property record</li>
            <li>Stop & resume anytime — offset tracking persists within session</li>
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
