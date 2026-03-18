import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Settings, AlertTriangle, Shield, Activity, Bug, FileWarning,
  Bell, MessageSquare, RefreshCw, CheckCircle, XCircle, Filter,
  TrendingUp, Clock, Zap, Globe, Server, Database
} from 'lucide-react';

interface ErrorClassification {
  code: string;
  label: string;
  category: 'system' | 'client' | 'both';
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertEnabled: boolean;
}

const DEFAULT_CLASSIFICATIONS: ErrorClassification[] = [
  { code: '404', label: 'Not Found', category: 'both', severity: 'low', alertEnabled: false },
  { code: '400', label: 'Bad Request', category: 'client', severity: 'low', alertEnabled: false },
  { code: '401', label: 'Unauthorized', category: 'client', severity: 'medium', alertEnabled: true },
  { code: '403', label: 'Forbidden', category: 'client', severity: 'medium', alertEnabled: true },
  { code: '408', label: 'Request Timeout', category: 'both', severity: 'medium', alertEnabled: true },
  { code: '429', label: 'Too Many Requests', category: 'client', severity: 'high', alertEnabled: true },
  { code: '500', label: 'Internal Server Error', category: 'system', severity: 'critical', alertEnabled: true },
  { code: '502', label: 'Bad Gateway', category: 'system', severity: 'critical', alertEnabled: true },
  { code: '503', label: 'Service Unavailable', category: 'system', severity: 'critical', alertEnabled: true },
  { code: '504', label: 'Gateway Timeout', category: 'system', severity: 'high', alertEnabled: true },
  { code: 'component_error', label: 'React Component Error', category: 'system', severity: 'high', alertEnabled: true },
  { code: 'api_error', label: 'API Call Failure', category: 'system', severity: 'high', alertEnabled: true },
  { code: 'search_error', label: 'Search Error', category: 'system', severity: 'medium', alertEnabled: false },
  { code: 'db_error', label: 'Database Error', category: 'system', severity: 'critical', alertEnabled: true },
];

const SystemErrorSettings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('classification');
  const [classifications, setClassifications] = useState<ErrorClassification[]>(DEFAULT_CLASSIFICATIONS);
  const [isSaving, setIsSaving] = useState(false);

  // Threshold settings
  const [thresholds, setThresholds] = useState({
    errorsPerMinute: 10,
    criticalErrorsPerHour: 5,
    errorRatePercent: 5,
    notifyOnCritical: true,
    notifyOnHighVolume: true,
    notifyViaChat: true,
    notifyViaPush: true,
    autoCreateChatThread: true,
    cooldownMinutes: 15,
  });

  // Logging settings
  const [logging, setLogging] = useState({
    enabled: true,
    retentionDays: 30,
    logClientErrors: true,
    logSystemErrors: true,
    log404Errors: true,
    logStackTraces: true,
    logUserAgent: true,
    logRequestHeaders: false,
    maskSensitiveData: true,
  });

  // Error stats for the overview
  const { data: errorStats } = useQuery({
    queryKey: ['system-error-settings-stats'],
    queryFn: async () => {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

      const [totalRes, criticalRes, unresolvedRes, last24hRes, lastHourRes, error404Res] = await Promise.all([
        supabase.from('error_logs').select('*', { count: 'exact', head: true }),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).eq('error_type', 'critical'),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).gte('created_at', last24h),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).gte('created_at', lastHour),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).eq('error_type', '404'),
      ]);

      return {
        total: totalRes.count || 0,
        critical: criticalRes.count || 0,
        unresolved: unresolvedRes.count || 0,
        last24h: last24hRes.count || 0,
        lastHour: lastHourRes.count || 0,
        total404: error404Res.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save settings to localStorage for now (can be migrated to DB table later)
      const settingsPayload = {
        classifications,
        thresholds,
        logging,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem('system_error_settings', JSON.stringify(settingsPayload));
      toast.success('Error settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateClassification = (index: number, field: keyof ErrorClassification, value: any) => {
    const updated = [...classifications];
    (updated[index] as any)[field] = value;
    setClassifications(updated);
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      system: 'bg-destructive/10 text-destructive border-destructive/20',
      client: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      both: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    };
    return <Badge variant="outline" className={`text-[9px] ${styles[category]}`}>{category.toUpperCase()}</Badge>;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'text-destructive',
      high: 'text-chart-4',
      medium: 'text-chart-3',
      low: 'text-muted-foreground',
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            System Error Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure error classification, alert thresholds, logging, and chat integration
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving} size="sm">
          {isSaving ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
          Save Settings
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: 'Total Errors', value: errorStats?.total ?? 0, icon: Bug, color: 'text-foreground' },
          { label: 'Critical', value: errorStats?.critical ?? 0, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Unresolved', value: errorStats?.unresolved ?? 0, icon: XCircle, color: 'text-chart-4' },
          { label: 'Last 24h', value: errorStats?.last24h ?? 0, icon: Clock, color: 'text-chart-3' },
          { label: 'Last Hour', value: errorStats?.lastHour ?? 0, icon: Activity, color: 'text-chart-2' },
          { label: '404 Errors', value: errorStats?.total404 ?? 0, icon: Globe, color: 'text-muted-foreground' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className={`text-lg font-bold tabular-nums ${color}`}>{value}</span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="classification" className="text-xs gap-1">
            <Filter className="h-3 w-3" /> Classification
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="text-xs gap-1">
            <Bell className="h-3 w-3" /> Thresholds
          </TabsTrigger>
          <TabsTrigger value="logging" className="text-xs gap-1">
            <Database className="h-3 w-3" /> Logging
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs gap-1">
            <MessageSquare className="h-3 w-3" /> Chat Link
          </TabsTrigger>
        </TabsList>

        {/* Classification Tab */}
        <TabsContent value="classification" className="mt-3">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Error Classification Rules
              </CardTitle>
              <CardDescription className="text-xs">
                Define how each error type is categorized: <Badge variant="outline" className="text-[8px] bg-destructive/10 text-destructive">SYSTEM</Badge> for server/infra failures, <Badge variant="outline" className="text-[8px] bg-chart-3/10 text-chart-3">CLIENT</Badge> for user/routing errors, <Badge variant="outline" className="text-[8px] bg-chart-2/10 text-chart-2">BOTH</Badge> for errors counted in all views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-1">
                  {/* Header */}
                  <div className="grid grid-cols-[60px_1fr_100px_90px_60px] gap-2 px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <span>Code</span>
                    <span>Label</span>
                    <span>Category</span>
                    <span>Severity</span>
                    <span>Alert</span>
                  </div>
                  {classifications.map((cls, i) => (
                    <div key={cls.code} className="grid grid-cols-[60px_1fr_100px_90px_60px] gap-2 items-center px-2 py-1.5 rounded hover:bg-muted/30 transition-colors">
                      <Badge variant="outline" className="text-[9px] font-mono justify-center">{cls.code}</Badge>
                      <span className="text-xs text-foreground">{cls.label}</span>
                      <Select
                        value={cls.category}
                        onValueChange={(v) => updateClassification(i, 'category', v)}
                      >
                        <SelectTrigger className="h-6 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={cls.severity}
                        onValueChange={(v) => updateClassification(i, 'severity', v)}
                      >
                        <SelectTrigger className={`h-6 text-[10px] ${getSeverityColor(cls.severity)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch
                        checked={cls.alertEnabled}
                        onCheckedChange={(v) => updateClassification(i, 'alertEnabled', v)}
                        className="scale-75"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator className="my-3" />
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                <Globe className="h-4 w-4 text-chart-2" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">404 Errors Classification</p>
                  <p className="text-[10px] text-muted-foreground">
                    404 errors are classified as <strong>"Both"</strong> — they appear in the Client Errors view 
                    AND the combined All Errors view. Change to "System" if 404s indicate broken internal routes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="mt-3">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-chart-3" />
                Alert Threshold Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Set when the system should trigger admin alerts based on error volume and severity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Errors per minute (trigger alert)</Label>
                  <Input
                    type="number"
                    value={thresholds.errorsPerMinute}
                    onChange={(e) => setThresholds(p => ({ ...p, errorsPerMinute: +e.target.value }))}
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Alert when errors exceed this rate per minute</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Critical errors per hour</Label>
                  <Input
                    type="number"
                    value={thresholds.criticalErrorsPerHour}
                    onChange={(e) => setThresholds(p => ({ ...p, criticalErrorsPerHour: +e.target.value }))}
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Alert when critical errors exceed this count hourly</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Error rate threshold (%)</Label>
                  <Input
                    type="number"
                    value={thresholds.errorRatePercent}
                    onChange={(e) => setThresholds(p => ({ ...p, errorRatePercent: +e.target.value }))}
                    className="h-8 text-xs"
                    min={0}
                    max={100}
                  />
                  <p className="text-[10px] text-muted-foreground">Alert when error rate exceeds this percentage of total requests</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Cooldown period (minutes)</Label>
                  <Input
                    type="number"
                    value={thresholds.cooldownMinutes}
                    onChange={(e) => setThresholds(p => ({ ...p, cooldownMinutes: +e.target.value }))}
                    className="h-8 text-xs"
                    min={1}
                  />
                  <p className="text-[10px] text-muted-foreground">Minimum time between repeated alerts for same error type</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-foreground">Notification Channels</h4>
                <div className="space-y-2">
                  {[
                    { key: 'notifyOnCritical', label: 'Notify on critical errors', desc: 'Immediate alert for severity=critical' },
                    { key: 'notifyOnHighVolume', label: 'Notify on high volume', desc: 'Alert when error rate exceeds threshold' },
                    { key: 'notifyViaPush', label: 'Push notifications', desc: 'Send browser push notifications to admins' },
                    { key: 'notifyViaChat', label: 'Chat notifications', desc: 'Post error alerts to admin chat system' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                      <div>
                        <p className="text-xs font-medium text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={(thresholds as any)[key]}
                        onCheckedChange={(v) => setThresholds(p => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logging Tab */}
        <TabsContent value="logging" className="mt-3">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-chart-2" />
                Error Logging Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Control what error data is captured, stored, and how long it's retained
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">Error Logging</p>
                  <p className="text-xs text-muted-foreground">Master toggle — disable to stop all error tracking</p>
                </div>
                <Switch
                  checked={logging.enabled}
                  onCheckedChange={(v) => setLogging(p => ({ ...p, enabled: v }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Retention Period (days)</Label>
                <Select
                  value={String(logging.retentionDays)}
                  onValueChange={(v) => setLogging(p => ({ ...p, retentionDays: +v }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">Capture Settings</h4>
                {[
                  { key: 'logSystemErrors', label: 'Log system errors (5xx)', desc: 'Server-side failures and infrastructure errors' },
                  { key: 'logClientErrors', label: 'Log client errors (4xx)', desc: 'User-facing errors like 400, 401, 403' },
                  { key: 'log404Errors', label: 'Log 404 errors', desc: 'Page not found errors — counted in both client & all errors' },
                  { key: 'logStackTraces', label: 'Capture stack traces', desc: 'Include full error stack for debugging' },
                  { key: 'logUserAgent', label: 'Log user agent', desc: 'Record browser/device info with errors' },
                  { key: 'logRequestHeaders', label: 'Log request headers', desc: 'Store HTTP headers (may contain sensitive data)' },
                  { key: 'maskSensitiveData', label: 'Mask sensitive data', desc: 'Auto-redact tokens, passwords, and API keys from logs' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={(logging as any)[key]}
                      onCheckedChange={(v) => setLogging(p => ({ ...p, [key]: v }))}
                      disabled={!logging.enabled}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Link Tab */}
        <TabsContent value="chat" className="mt-3">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-chart-1" />
                Chat Error Integration
              </CardTitle>
              <CardDescription className="text-xs">
                Automatically create chat support threads when users encounter errors, with full error context attached
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-chart-1/5 border border-chart-1/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">Auto-Create Chat Thread on Error</p>
                  <p className="text-xs text-muted-foreground">
                    When a user encounters an error, automatically open a support chat thread with error context (type, page, stack trace)
                  </p>
                </div>
                <Switch
                  checked={thresholds.autoCreateChatThread}
                  onCheckedChange={(v) => setThresholds(p => ({ ...p, autoCreateChatThread: v }))}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-foreground">How It Works</h4>
                <div className="space-y-2">
                  {[
                    { step: '1', title: 'Error Detected', desc: 'errorLogger captures the error with full context (type, severity, page URL, stack trace, user info)', icon: Bug },
                    { step: '2', title: 'Chat Thread Created', desc: 'A support chat thread is auto-created with the error details pre-filled for the user', icon: MessageSquare },
                    { step: '3', title: 'Admin Notified', desc: 'Admin receives a notification in the alert system and can respond directly in the chat thread', icon: Bell },
                    { step: '4', title: 'Error Linked', desc: 'The error log entry is linked to the chat thread — admin can click through from error logs to the conversation', icon: Zap },
                  ].map(({ step, title, desc, icon: Icon }) => (
                    <div key={step} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                        {step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs font-medium text-foreground">{title}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">Error Types That Trigger Chat</h4>
                <div className="flex flex-wrap gap-1.5">
                  {classifications.filter(c => c.alertEnabled).map(cls => (
                    <Badge key={cls.code} variant="outline" className="text-[9px] gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        cls.severity === 'critical' ? 'bg-destructive' :
                        cls.severity === 'high' ? 'bg-chart-4' :
                        cls.severity === 'medium' ? 'bg-chart-3' : 'bg-muted-foreground'
                      }`} />
                      {cls.code} — {cls.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Only errors with alerts enabled in the Classification tab will trigger chat threads. 
                  Enable/disable alerts per error type in the Classification tab.
                </p>
              </div>

              <Separator />

              <div className="p-3 rounded-lg bg-chart-3/5 border border-chart-3/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Usage from Error Logs</p>
                    <p className="text-[10px] text-muted-foreground">
                      Admins can reference any error in the chat system by clicking "Link to Chat" on an error log entry 
                      in the Bug & Error Detection or Error Logs sections. This shares the full error context 
                      (error ID, stack trace, affected user) into the conversation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemErrorSettings;
