import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Activity, Database, Zap, Clock, Server, Wifi } from "lucide-react";
import { toast } from "sonner";

interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency?: number;
  details?: string;
}

const SystemHealthDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check DB health via simple query
  const { data: dbHealth, refetch: refetchDb } = useQuery({
    queryKey: ["system-health-db"],
    queryFn: async (): Promise<HealthCheck> => {
      const start = performance.now();
      try {
        const { error } = await supabase.from("profiles").select("id").limit(1);
        const latency = Math.round(performance.now() - start);
        return {
          name: "Database",
          status: error ? "degraded" : latency > 2000 ? "degraded" : "healthy",
          latency,
          details: error ? error.message : `Response in ${latency}ms`,
        };
      } catch {
        return { name: "Database", status: "down", details: "Connection failed" };
      }
    },
    refetchInterval: 30000,
  });

  // Check Auth health
  const { data: authHealth, refetch: refetchAuth } = useQuery({
    queryKey: ["system-health-auth"],
    queryFn: async (): Promise<HealthCheck> => {
      const start = performance.now();
      try {
        const { error } = await supabase.auth.getSession();
        const latency = Math.round(performance.now() - start);
        return {
          name: "Authentication",
          status: error ? "degraded" : "healthy",
          latency,
          details: error ? error.message : `Session check ${latency}ms`,
        };
      } catch {
        return { name: "Authentication", status: "down", details: "Auth service unreachable" };
      }
    },
    refetchInterval: 30000,
  });

  // Check Storage health
  const { data: storageHealth, refetch: refetchStorage } = useQuery({
    queryKey: ["system-health-storage"],
    queryFn: async (): Promise<HealthCheck> => {
      const start = performance.now();
      try {
        const { error } = await supabase.storage.listBuckets();
        const latency = Math.round(performance.now() - start);
        return {
          name: "Storage",
          status: error ? "degraded" : "healthy",
          latency,
          details: error ? error.message : `Buckets listed in ${latency}ms`,
        };
      } catch {
        return { name: "Storage", status: "down", details: "Storage unreachable" };
      }
    },
    refetchInterval: 30000,
  });

  // Edge function health (core-engine ping)
  const { data: edgeHealth, refetch: refetchEdge } = useQuery({
    queryKey: ["system-health-edge"],
    queryFn: async (): Promise<HealthCheck> => {
      const start = performance.now();
      try {
        const { error } = await supabase.functions.invoke("core-engine", {
          body: { mode: "ai_performance_summary" },
        });
        const latency = Math.round(performance.now() - start);
        return {
          name: "Edge Functions",
          status: error ? "degraded" : latency > 5000 ? "degraded" : "healthy",
          latency,
          details: error ? "Function error" : `Core engine responded in ${latency}ms`,
        };
      } catch {
        return { name: "Edge Functions", status: "down", details: "Edge runtime unreachable" };
      }
    },
    refetchInterval: 60000,
  });

  // DB table stats
  const { data: tableStats } = useQuery({
    queryKey: ["system-health-tables"],
    queryFn: async () => {
      const tableNames = ["properties", "profiles", "user_sessions", "ai_recommendation_events", "activity_logs"] as const;
      const results: { name: string; count: number }[] = [];
      for (const t of tableNames) {
        const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
        results.push({ name: t, count: count ?? 0 });
      }
      return results;
    },
    refetchInterval: 60000,
  });

  // Cron job stats
  const { data: cronStats } = useQuery({
    queryKey: ["system-health-cron"],
    queryFn: async () => {
      const { data: jobs } = await supabase.rpc("get_cron_jobs");
      const { data: runs } = await supabase.rpc("get_cron_job_runs");
      const active = (jobs || []).filter((j: any) => j.active).length;
      const recentFails = (runs || []).filter((r: any) => r.status === "failed").length;
      return { total: (jobs || []).length, active, recentFails };
    },
    refetchInterval: 60000,
  });

  const allChecks = [dbHealth, authHealth, storageHealth, edgeHealth].filter(Boolean) as HealthCheck[];
  const overallStatus = allChecks.some((c) => c.status === "down")
    ? "critical"
    : allChecks.some((c) => c.status === "degraded")
    ? "degraded"
    : "operational";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchDb(), refetchAuth(), refetchStorage(), refetchEdge()]);
    setIsRefreshing(false);
    toast.success("Health checks refreshed");
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "healthy") return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === "degraded") return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const ServiceIcon = ({ name }: { name: string }) => {
    if (name === "Database") return <Database className="h-4 w-4" />;
    if (name === "Authentication") return <Wifi className="h-4 w-4" />;
    if (name === "Storage") return <Server className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getLatencyColor = (ms?: number) => {
    if (!ms) return "bg-muted";
    if (ms < 500) return "bg-green-500";
    if (ms < 2000) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            System Health Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time infrastructure monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={overallStatus === "operational" ? "default" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {overallStatus === "operational" ? "All Systems Operational" : overallStatus === "degraded" ? "Partial Degradation" : "Critical Issues"}
          </Badge>
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allChecks.map((check) => (
          <Card key={check.name} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ServiceIcon name={check.name} />
                  <span className="font-medium text-sm">{check.name}</span>
                </div>
                <StatusIcon status={check.status} />
              </div>
              <p className="text-xs text-muted-foreground mb-2">{check.details}</p>
              {check.latency !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Latency
                    </span>
                    <span className="font-mono">{check.latency}ms</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getLatencyColor(check.latency)}`}
                      style={{ width: `${Math.min(100, (check.latency / 3000) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Table Stats</TabsTrigger>
          <TabsTrigger value="cron">Cron Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <Card>
            <CardHeader><CardTitle className="text-base">Database Table Row Counts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(tableStats || []).map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">{t.name}</span>
                    <Badge variant="secondary">{t.count.toLocaleString()} rows</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cron">
          <Card>
            <CardHeader><CardTitle className="text-base">Cron Job Summary</CardTitle></CardHeader>
            <CardContent>
              {cronStats ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{cronStats.total}</div>
                    <div className="text-xs text-muted-foreground">Total Jobs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">{cronStats.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">{cronStats.recentFails}</div>
                    <div className="text-xs text-muted-foreground">Recent Failures</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;
