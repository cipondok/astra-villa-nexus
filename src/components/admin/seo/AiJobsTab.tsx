import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Loader2, XCircle, CheckCircle2, Clock, Play, AlertTriangle,
  ListChecks, BarChart3, Activity, RotateCcw, Wifi,
} from 'lucide-react';
import {
  useAiJobs, useAiJobTasks, useAiJobLogs, useAiJobMetrics, useCancelJob,
  type AiJob,
} from '@/hooks/useAiJobs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending:   { icon: <Clock className="h-3.5 w-3.5" />,                    color: 'bg-muted text-muted-foreground',                          label: 'Pending' },
  running:   { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,     color: 'bg-chart-4/15 text-chart-4 border-chart-4/30',           label: 'Running' },
  completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />,             color: 'bg-chart-1/15 text-chart-1 border-chart-1/30',           label: 'Completed' },
  failed:    { icon: <XCircle className="h-3.5 w-3.5" />,                  color: 'bg-destructive/15 text-destructive border-destructive/30', label: 'Failed' },
  cancelled: { icon: <XCircle className="h-3.5 w-3.5" />,                  color: 'bg-muted text-muted-foreground',                          label: 'Cancelled' },
};

const JOB_TYPE_LABELS: Record<string, string> = {
  seo_optimize: '⚡ SEO Optimize',
  seo_scan: '🔍 SEO Scan',
  investment_analysis: '📊 Investment Analysis',
};

const PRIORITY_LABELS: Record<number, string> = { 1: '🔴 Critical', 2: '🟠 High', 3: '🟡 Medium', 5: '🔵 Normal', 8: '⚪ Low' };

const LOG_LEVEL_COLORS: Record<string, string> = {
  info: 'text-chart-1',
  warning: 'text-chart-4',
  error: 'text-destructive',
};

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))', 'hsl(var(--chart-4))', 'hsl(var(--chart-2))'];

const AiJobsTab = () => {
  const { data: jobs = [], isLoading } = useAiJobs(50);
  const { data: metrics } = useAiJobMetrics();
  const cancelJob = useCancelJob();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { data: tasks = [] } = useAiJobTasks(selectedJobId);
  const { data: logs = [] } = useAiJobLogs(selectedJobId);

  const runningCount = jobs.filter(j => j.status === 'running').length;
  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const statusPieData = metrics ? [
    { name: 'Completed', value: metrics.statusCounts.completed },
    { name: 'Failed', value: metrics.statusCounts.failed },
    { name: 'Cancelled', value: metrics.statusCounts.cancelled },
    { name: 'Running', value: metrics.statusCounts.running },
    { name: 'Pending', value: metrics.statusCounts.pending },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-chart-4/5 border-chart-4/20">
          <CardContent className="p-3 flex items-center gap-2">
            <Play className="h-4 w-4 text-chart-4" />
            <div>
              <p className="text-lg font-bold text-foreground">{runningCount}</p>
              <p className="text-[10px] text-muted-foreground">Running</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-border/30">
          <CardContent className="p-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold text-foreground">{pendingCount}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-chart-1/5 border-chart-1/20">
          <CardContent className="p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-chart-1" />
            <div>
              <p className="text-lg font-bold text-foreground">{completedCount}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-lg font-bold text-foreground">{failedCount}</p>
              <p className="text-[10px] text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Charts */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-card border-border/50">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-primary" /> Jobs per Day
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.jobsByDay}>
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} width={20} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-chart-4" /> Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25} strokeWidth={2} stroke="hsl(var(--background))">
                    {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-chart-1" /> Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Avg Duration</span>
                <span className="text-xs font-bold text-foreground">{metrics.avgDurationSec}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Task Failure Rate</span>
                <span className={`text-xs font-bold ${metrics.failureRate > 10 ? 'text-destructive' : 'text-chart-1'}`}>{metrics.failureRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Total Jobs (14d)</span>
                <span className="text-xs font-bold text-foreground">{metrics.totalJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Total Tasks (14d)</span>
                <span className="text-xs font-bold text-foreground">{metrics.totalTasks}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs Table */}
      <Card className="bg-card border-border/50">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            AI Job Queue
          </CardTitle>
          <CardDescription className="text-[10px]">
            Server-side batch jobs · Realtime updates
            <Wifi className="inline h-2.5 w-2.5 ml-1 text-chart-1" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No jobs yet. Run a bulk SEO optimization to create one.</p>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {jobs.map((job) => {
                  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
                  const priorityLabel = PRIORITY_LABELS[job.priority] || `P${job.priority}`;
                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-border/70 transition-colors cursor-pointer group"
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </Badge>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{JOB_TYPE_LABELS[job.job_type] || job.job_type}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{job.id.slice(0, 8)}</span>
                          <span className="text-[9px] text-muted-foreground">{priorityLabel}</span>
                        </div>
                        {job.payload?.states && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            States: {(job.payload.states as string[]).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="w-32 shrink-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{job.completed_tasks}/{job.total_tasks}</span>
                          <span className="text-[10px] font-bold text-foreground">{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-1.5" />
                      </div>

                      <div className="w-24 shrink-0 text-right">
                        <p className="text-[10px] text-muted-foreground">{fmtDate(job.created_at)}</p>
                        {job.completed_at && (
                          <p className="text-[9px] text-muted-foreground">Done: {fmtDate(job.completed_at)}</p>
                        )}
                      </div>

                      {(job.status === 'pending' || job.status === 'running') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] text-destructive opacity-0 group-hover:opacity-100 shrink-0"
                          onClick={(e) => { e.stopPropagation(); cancelJob.mutate(job.id); }}
                          disabled={cancelJob.isPending}
                        >
                          <XCircle className="h-3 w-3 mr-0.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Task + Logs Detail Dialog */}
      <Dialog open={!!selectedJobId} onOpenChange={() => setSelectedJobId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Job Details
              <Badge variant="outline" className="text-[9px] font-mono">{selectedJobId?.slice(0, 8)}</Badge>
            </DialogTitle>
            <DialogDescription className="text-[10px]">Tasks, retries, and execution logs</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="tasks" className="mt-2">
            <TabsList className="h-7">
              <TabsTrigger value="tasks" className="text-[10px] h-6 px-3">Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="logs" className="text-[10px] h-6 px-3">Logs ({logs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <ScrollArea className="h-[350px]">
                <div className="space-y-1.5">
                  {tasks.map((task) => {
                    const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={task.id} className="flex items-center gap-2 p-2 rounded border border-border/30 text-xs">
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 gap-0.5 ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </Badge>
                        <span className="text-foreground font-medium">{task.payload?.state || task.task_type}</span>
                        {task.retry_count > 0 && (
                          <Badge variant="secondary" className="text-[9px] gap-0.5">
                            <RotateCcw className="h-2.5 w-2.5" /> {task.retry_count}
                          </Badge>
                        )}
                        <span className="text-[9px] text-muted-foreground font-mono ml-auto">{task.id.slice(0, 8)}</span>
                        {task.result?.optimized !== undefined && (
                          <Badge variant="secondary" className="text-[9px]">{task.result.optimized} optimized</Badge>
                        )}
                        {task.result?.error && (
                          <Badge variant="destructive" className="text-[9px]">{task.result.error}</Badge>
                        )}
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No tasks found</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="logs">
              <ScrollArea className="h-[350px]">
                <div className="space-y-0.5 font-mono text-[10px]">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 px-2 py-1 rounded hover:bg-muted/30">
                      <span className="text-muted-foreground shrink-0 w-[110px]">
                        {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={`shrink-0 w-[50px] uppercase font-bold ${LOG_LEVEL_COLORS[log.level] || 'text-foreground'}`}>
                        {log.level}
                      </span>
                      <span className="text-foreground">{log.message}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8 font-sans">No logs yet</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiJobsTab;
