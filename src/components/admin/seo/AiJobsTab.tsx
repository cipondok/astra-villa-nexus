import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, XCircle, CheckCircle2, Clock, Play, AlertTriangle, ListChecks } from 'lucide-react';
import { useAiJobs, useAiJobTasks, useCancelJob, type AiJob } from '@/hooks/useAiJobs';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-3.5 w-3.5" />, color: 'bg-muted text-muted-foreground', label: 'Pending' },
  running: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, color: 'bg-chart-4/15 text-chart-4 border-chart-4/30', label: 'Running' },
  completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'bg-chart-1/15 text-chart-1 border-chart-1/30', label: 'Completed' },
  failed: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'bg-destructive/15 text-destructive border-destructive/30', label: 'Failed' },
  cancelled: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'bg-muted text-muted-foreground', label: 'Cancelled' },
};

const JOB_TYPE_LABELS: Record<string, string> = {
  seo_optimize: '⚡ SEO Optimize',
  seo_scan: '🔍 SEO Scan',
  investment_analysis: '📊 Investment Analysis',
};

const AiJobsTab = () => {
  const { data: jobs = [], isLoading } = useAiJobs(50);
  const cancelJob = useCancelJob();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { data: tasks = [] } = useAiJobTasks(selectedJobId);

  const runningCount = jobs.filter(j => j.status === 'running').length;
  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

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

      {/* Jobs Table */}
      <Card className="bg-card border-border/50">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            AI Job Queue
          </CardTitle>
          <CardDescription className="text-[10px]">Server-side batch jobs · Auto-polled every 5s</CardDescription>
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

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedJobId} onOpenChange={() => setSelectedJobId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Job Tasks
              <Badge variant="outline" className="text-[9px] font-mono">{selectedJobId?.slice(0, 8)}</Badge>
            </DialogTitle>
            <DialogDescription className="text-[10px]">Individual tasks within this job</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-2">
            <div className="space-y-1.5">
              {tasks.map((task) => {
                const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                return (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded border border-border/30 text-xs">
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 gap-0.5 ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </Badge>
                    <span className="text-foreground font-medium">{task.payload?.state || task.task_type}</span>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiJobsTab;
