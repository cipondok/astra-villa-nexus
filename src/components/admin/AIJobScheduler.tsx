import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  CalendarClock, Plus, Pencil, Trash2, Play, Pause, Clock,
  Zap, Search, TrendingUp, BarChart3, Shield, Bot, RefreshCw,
  ChevronRight, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateJob } from '@/hooks/useAiJobs';
import { formatDistanceToNow } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  job_type: string;
  payload: Record<string, any>;
  cron_expression: string;
  cron_label: string;
  enabled: boolean;
  priority: number;
  last_run_at: string | null;
  created_at: string;
}

// ─── Preset Templates ───────────────────────────────────────────────────────
const JOB_TEMPLATES = [
  { type: 'seo_scan', label: 'SEO Scan', icon: Search, description: 'Scan all properties for SEO issues', color: 'text-chart-1' },
  { type: 'ai_optimization', label: 'AI Optimization', icon: Zap, description: 'Run AI optimization on weak listings', color: 'text-chart-2' },
  { type: 'roi_forecast', label: 'ROI Forecast', icon: TrendingUp, description: 'Recalculate ROI forecasts for all properties', color: 'text-chart-3' },
  { type: 'market_analysis', label: 'Market Analysis', icon: BarChart3, description: 'Run market trend analysis', color: 'text-chart-4' },
  { type: 'valuation_update', label: 'Valuation Update', icon: Bot, description: 'Update property valuations', color: 'text-primary' },
  { type: 'system_health_check', label: 'Health Check', icon: Shield, description: 'Run comprehensive system health check', color: 'text-chart-1' },
];

const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 */12 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 3 AM', value: '0 3 * * *' },
  { label: 'Daily at 6 AM', value: '0 6 * * *' },
  { label: 'Every Monday', value: '0 0 * * 1' },
  { label: 'Every 1st of month', value: '0 0 1 * *' },
];

// ─── Storage helpers ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'astra_scheduled_jobs';

function loadScheduledJobs(): ScheduledJob[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveScheduledJobs(jobs: ScheduledJob[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function getCronLabel(cron: string): string {
  const preset = CRON_PRESETS.find(p => p.value === cron);
  return preset?.label || cron;
}

// ─── Component ──────────────────────────────────────────────────────────────
const AIJobScheduler = () => {
  const [jobs, setJobs] = useState<ScheduledJob[]>(loadScheduledJobs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ScheduledJob | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const createJob = useCreateJob();

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('');
  const [formCron, setFormCron] = useState('0 */6 * * *');
  const [formPriority, setFormPriority] = useState(5);

  const resetForm = useCallback(() => {
    setFormName(''); setFormDesc(''); setFormType(''); setFormCron('0 */6 * * *'); setFormPriority(5);
    setEditingJob(null);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((job: ScheduledJob) => {
    setEditingJob(job);
    setFormName(job.name);
    setFormDesc(job.description);
    setFormType(job.job_type);
    setFormCron(job.cron_expression);
    setFormPriority(job.priority);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formType) {
      toast.error('Name and job type are required');
      return;
    }

    const template = JOB_TEMPLATES.find(t => t.type === formType);
    const updated = [...jobs];

    if (editingJob) {
      const idx = updated.findIndex(j => j.id === editingJob.id);
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          name: formName.trim(),
          description: formDesc.trim() || template?.description || '',
          job_type: formType,
          cron_expression: formCron,
          cron_label: getCronLabel(formCron),
          priority: formPriority,
        };
      }
      toast.success('Schedule updated');
    } else {
      updated.push({
        id: crypto.randomUUID(),
        name: formName.trim(),
        description: formDesc.trim() || template?.description || '',
        job_type: formType,
        payload: {},
        cron_expression: formCron,
        cron_label: getCronLabel(formCron),
        enabled: true,
        priority: formPriority,
        last_run_at: null,
        created_at: new Date().toISOString(),
      });
      toast.success('Schedule created');
    }

    setJobs(updated);
    saveScheduledJobs(updated);
    setDialogOpen(false);
    resetForm();
  }, [formName, formDesc, formType, formCron, formPriority, jobs, editingJob, resetForm]);

  const toggleJob = useCallback((id: string) => {
    const updated = jobs.map(j => j.id === id ? { ...j, enabled: !j.enabled } : j);
    setJobs(updated);
    saveScheduledJobs(updated);
    const job = updated.find(j => j.id === id);
    toast.success(`${job?.name} ${job?.enabled ? 'enabled' : 'disabled'}`);
  }, [jobs]);

  const deleteJob = useCallback((id: string) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    saveScheduledJobs(updated);
    setDeleteConfirm(null);
    toast.success('Schedule deleted');
  }, [jobs]);

  const runNow = useCallback((job: ScheduledJob) => {
    createJob.mutate(
      { job_type: job.job_type, payload: job.payload, priority: job.priority },
      {
        onSuccess: () => {
          const updated = jobs.map(j => j.id === job.id ? { ...j, last_run_at: new Date().toISOString() } : j);
          setJobs(updated);
          saveScheduledJobs(updated);
        },
      }
    );
  }, [createJob, jobs]);

  const applyTemplate = useCallback((type: string) => {
    const template = JOB_TEMPLATES.find(t => t.type === type);
    if (template) {
      setFormType(type);
      if (!formName) setFormName(template.label);
      if (!formDesc) setFormDesc(template.description);
    }
  }, [formName, formDesc]);

  const enabledCount = jobs.filter(j => j.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            AI Job Scheduler
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Schedule recurring AI tasks • {enabledCount} active / {jobs.length} total
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs h-8" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> New Schedule
        </Button>
      </div>

      {/* Quick Templates */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {JOB_TEMPLATES.map((tpl) => (
              <button
                key={tpl.type}
                onClick={() => {
                  resetForm();
                  setFormType(tpl.type);
                  setFormName(tpl.label);
                  setFormDesc(tpl.description);
                  setDialogOpen(true);
                }}
                className="p-3 rounded-lg border border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
              >
                <tpl.icon className={`h-5 w-5 mx-auto mb-1.5 ${tpl.color} group-hover:scale-110 transition-transform`} />
                <p className="text-[11px] font-medium text-foreground">{tpl.label}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Jobs List */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Scheduled Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarClock className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No scheduled jobs yet</p>
              <p className="text-xs mt-1">Use templates above or create a custom schedule</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <AnimatePresence>
                <div className="space-y-2">
                  {jobs.map((job, i) => {
                    const tpl = JOB_TEMPLATES.find(t => t.type === job.job_type);
                    const TplIcon = tpl?.icon || Bot;
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.03 }}
                        className={`p-3 rounded-lg border transition-all ${
                          job.enabled
                            ? 'bg-muted/10 border-border/40 hover:border-primary/20'
                            : 'bg-muted/5 border-border/20 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${job.enabled ? 'bg-primary/10' : 'bg-muted/20'}`}>
                            <TplIcon className={`h-4 w-4 ${job.enabled ? (tpl?.color || 'text-primary') : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-foreground truncate">{job.name}</p>
                              <Badge variant="outline" className="text-[9px] shrink-0">{job.cron_label}</Badge>
                              {!job.enabled && <Badge variant="secondary" className="text-[9px]">Paused</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{job.description}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-muted-foreground">
                                Priority: {job.priority}
                              </span>
                              {job.last_run_at && (
                                <span className="text-[10px] text-muted-foreground">
                                  Last run: {formatDistanceToNow(new Date(job.last_run_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Switch
                              checked={job.enabled}
                              onCheckedChange={() => toggleJob(job.id)}
                              className="scale-75"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => runNow(job)}
                              disabled={createJob.isPending}
                              title="Run now"
                            >
                              <Play className="h-3.5 w-3.5 text-chart-1" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => openEdit(job)}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setDeleteConfirm(job.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              {editingJob ? 'Edit Schedule' : 'Create New Schedule'}
            </DialogTitle>
            <DialogDescription>
              {editingJob ? 'Update the recurring job schedule.' : 'Set up a recurring AI job with a cron schedule.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Job Type */}
            <div className="space-y-1.5">
              <Label className="text-xs">Job Type</Label>
              <Select value={formType} onValueChange={applyTemplate}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TEMPLATES.map(tpl => (
                    <SelectItem key={tpl.type} value={tpl.type}>
                      <span className="flex items-center gap-2">
                        <tpl.icon className={`h-3.5 w-3.5 ${tpl.color}`} />
                        {tpl.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs">Schedule Name</Label>
              <Input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g., Nightly SEO Scan"
                className="text-xs h-9"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="What does this job do?"
                className="text-xs h-9"
              />
            </div>

            {/* Cron */}
            <div className="space-y-1.5">
              <Label className="text-xs">Schedule Frequency</Label>
              <Select value={formCron} onValueChange={setFormCron}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRON_PRESETS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} <span className="text-muted-foreground ml-2">({p.value})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs">Priority (1 = highest, 10 = lowest)</Label>
              <Select value={formPriority.toString()} onValueChange={v => setFormPriority(parseInt(v))}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} {p <= 3 ? '(High)' : p <= 7 ? '(Normal)' : '(Low)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5">
              {editingJob ? <RefreshCw className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {editingJob ? 'Update' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Schedule
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scheduled job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirm && deleteJob(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIJobScheduler;
