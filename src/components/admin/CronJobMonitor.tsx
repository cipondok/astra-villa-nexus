import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  RefreshCcw,
  Timer,
  CalendarClock,
  List,
} from "lucide-react";
import { useState, useMemo } from "react";

interface CronJob {
  jobid: number;
  schedule: string;
  command: string;
  jobname: string;
  active: boolean;
}

interface CronRun {
  runid: number;
  jobid: number;
  job_pid: number;
  status: string;
  return_message: string;
  start_time: string;
  end_time: string;
}

export default function CronJobMonitor() {
  const [activeTab, setActiveTab] = useState("jobs");

  const {
    data: jobs = [],
    isLoading: jobsLoading,
    refetch: refetchJobs,
    isFetching: jobsFetching,
  } = useQuery({
    queryKey: ["cron-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cron_jobs");
      if (error) throw error;
      return (data || []) as CronJob[];
    },
    staleTime: 30 * 1000,
  });

  const {
    data: runs = [],
    isLoading: runsLoading,
    refetch: refetchRuns,
    isFetching: runsFetching,
  } = useQuery({
    queryKey: ["cron-job-runs"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cron_job_runs", { p_limit: 100 });
      if (error) throw error;
      return (data || []) as CronRun[];
    },
    staleTime: 30 * 1000,
  });

  const jobNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    jobs.forEach((j) => (map[j.jobid] = j.jobname));
    return map;
  }, [jobs]);

  // Stats
  const stats = useMemo(() => {
    const succeeded = runs.filter((r) => r.status === "succeeded").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const running = runs.filter((r) => r.status === "running").length;
    return { total: jobs.length, succeeded, failed, running, totalRuns: runs.length };
  }, [jobs, runs]);

  // Extract function name from command
  const extractFnName = (cmd: string) => {
    const match = cmd.match(/functions\/v1\/([a-z0-9-]+)/i);
    return match ? match[1] : null;
  };

  const formatDuration = (start: string, end: string) => {
    if (!start || !end) return "—";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const isLoading = jobsLoading || runsLoading;
  const isFetching = jobsFetching || runsFetching;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cron Job Monitor</h2>
            <p className="text-sm text-muted-foreground">
              View and monitor all scheduled pg_cron jobs
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => { refetchJobs(); refetchRuns(); }}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Active Jobs" value={String(stats.total)} icon={<Clock className="h-4 w-4" />} color="text-primary" />
            <KpiCard label="Succeeded (recent)" value={String(stats.succeeded)} icon={<CheckCircle className="h-4 w-4" />} color="text-chart-1" />
            <KpiCard label="Failed (recent)" value={String(stats.failed)} icon={<XCircle className="h-4 w-4" />} color="text-destructive" />
            <KpiCard label="Total Runs" value={String(stats.totalRuns)} icon={<Activity className="h-4 w-4" />} color="text-chart-2" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="jobs" className="gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                Scheduled Jobs ({jobs.length})
              </TabsTrigger>
              <TabsTrigger value="runs" className="gap-1.5">
                <List className="h-3.5 w-3.5" />
                Run History
              </TabsTrigger>
            </TabsList>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="mt-4">
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Scheduled Jobs</CardTitle>
                  <CardDescription>All pg_cron jobs configured in this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Target Function</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.jobid}>
                          <TableCell className="font-mono text-xs">{job.jobid}</TableCell>
                          <TableCell className="font-medium">{job.jobname}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {job.schedule}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {extractFnName(job.command) || (
                              <span className="text-xs max-w-[200px] truncate block">{job.command.slice(0, 60)}…</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                job.active
                                  ? "border-chart-1 text-chart-1 bg-chart-1/10"
                                  : "border-muted-foreground text-muted-foreground"
                              }
                            >
                              {job.active ? "Active" : "Paused"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Runs Tab */}
            <TabsContent value="runs" className="mt-4">
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Run History</CardTitle>
                  <CardDescription>Last 100 cron job executions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[500px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {runs.map((run) => (
                          <TableRow key={run.runid}>
                            <TableCell className="font-medium text-sm">
                              {jobNameMap[run.jobid] || `Job #${run.jobid}`}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  run.status === "succeeded"
                                    ? "border-chart-1 text-chart-1 bg-chart-1/10"
                                    : run.status === "failed"
                                    ? "border-destructive text-destructive bg-destructive/10"
                                    : "border-chart-3 text-chart-3 bg-chart-3/10"
                                }
                              >
                                {run.status === "succeeded" ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : run.status === "failed" ? (
                                  <XCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Timer className="h-3 w-3 mr-1" />
                                )}
                                {run.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {formatDuration(run.start_time, run.end_time)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatTimeAgo(run.start_time)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">
                              {run.return_message || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {runs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No run history available yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="border-border/40 hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className={color}>{icon}</div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
