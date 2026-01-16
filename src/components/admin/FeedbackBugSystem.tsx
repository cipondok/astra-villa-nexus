import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bug, MessageSquare, AlertTriangle, CheckCircle, Clock, 
  RefreshCw, Eye, Send, Activity, Bell, Settings, 
  TrendingUp, Users, Zap, Shield
} from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: string;
  feedback_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  user_id: string;
  page_url: string;
}

interface SystemUpdate {
  id: string;
  version: string;
  title: string;
  title_id: string;
  description: string;
  description_id: string;
  update_type: string;
  status: string;
  scheduled_at: string;
  completed_at: string;
  downtime_expected: boolean;
}

interface HealthMetric {
  component: string;
  status: string;
  value: number;
  unit: string;
}

const text = {
  en: {
    pageTitle: "Feedback & System Health",
    subtitle: "Bug reports, feedback, system updates, and health monitoring",
    feedbackTab: "Feedback",
    bugsTab: "Bug Reports",
    updatesTab: "System Updates",
    healthTab: "Health",
    totalFeedback: "Total Feedback",
    openBugs: "Open Bugs",
    pendingUpdates: "Pending Updates",
    systemHealth: "System Health",
    submitFeedback: "Submit Feedback",
    feedbackType: "Type",
    bugReport: "Bug Report",
    featureRequest: "Feature Request",
    generalFeedback: "General Feedback",
    complaint: "Complaint",
    severity: "Severity",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    feedbackTitle: "Title",
    description: "Description",
    submit: "Submit",
    status: "Status",
    newStatus: "New",
    reviewing: "Reviewing",
    inProgress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    priority: "Priority",
    date: "Date",
    actions: "Actions",
    view: "View",
    noData: "No data found",
    loading: "Loading...",
    refresh: "Refresh",
    planned: "Planned",
    maintenance: "Maintenance",
    feature: "Feature",
    bugfix: "Bug Fix",
    security: "Security",
    improvement: "Improvement",
    healthy: "Healthy",
    degraded: "Degraded",
    down: "Down",
    database: "Database",
    api: "API",
    auth: "Authentication",
    payments: "Payments",
    storage: "Storage",
    uptime: "Uptime",
    responseTime: "Response Time",
    errorRate: "Error Rate",
    activeUsers: "Active Users"
  },
  id: {
    pageTitle: "Umpan Balik & Kesehatan Sistem",
    subtitle: "Laporan bug, umpan balik, pembaruan sistem, dan pemantauan kesehatan",
    feedbackTab: "Umpan Balik",
    bugsTab: "Laporan Bug",
    updatesTab: "Pembaruan",
    healthTab: "Kesehatan",
    totalFeedback: "Total Umpan Balik",
    openBugs: "Bug Terbuka",
    pendingUpdates: "Pembaruan Tertunda",
    systemHealth: "Kesehatan Sistem",
    submitFeedback: "Kirim Umpan Balik",
    feedbackType: "Tipe",
    bugReport: "Laporan Bug",
    featureRequest: "Permintaan Fitur",
    generalFeedback: "Umpan Balik Umum",
    complaint: "Keluhan",
    severity: "Tingkat Keparahan",
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
    critical: "Kritis",
    feedbackTitle: "Judul",
    description: "Deskripsi",
    submit: "Kirim",
    status: "Status",
    newStatus: "Baru",
    reviewing: "Ditinjau",
    inProgress: "Sedang Diproses",
    resolved: "Terselesaikan",
    closed: "Ditutup",
    priority: "Prioritas",
    date: "Tanggal",
    actions: "Aksi",
    view: "Lihat",
    noData: "Tidak ada data",
    loading: "Memuat...",
    refresh: "Segarkan",
    planned: "Direncanakan",
    maintenance: "Pemeliharaan",
    feature: "Fitur",
    bugfix: "Perbaikan Bug",
    security: "Keamanan",
    improvement: "Peningkatan",
    healthy: "Sehat",
    degraded: "Terdegradasi",
    down: "Mati",
    database: "Basis Data",
    api: "API",
    auth: "Autentikasi",
    payments: "Pembayaran",
    storage: "Penyimpanan",
    uptime: "Waktu Aktif",
    responseTime: "Waktu Respons",
    errorRate: "Tingkat Error",
    activeUsers: "Pengguna Aktif"
  }
};

const FeedbackBugSystem = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = text[language];
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // Form state
  const [formType, setFormType] = useState("general_feedback");
  const [formSeverity, setFormSeverity] = useState("medium");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Mock health data (would be real data from system_health_metrics)
  const healthMetrics: HealthMetric[] = [
    { component: "database", status: "healthy", value: 99.9, unit: "%" },
    { component: "api", status: "healthy", value: 45, unit: "ms" },
    { component: "auth", status: "healthy", value: 99.8, unit: "%" },
    { component: "payments", status: "healthy", value: 99.5, unit: "%" },
    { component: "storage", status: "healthy", value: 85, unit: "%" }
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [feedbackRes, updatesRes] = await Promise.all([
        supabase
          .from('user_feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('system_updates')
          .select('*')
          .order('scheduled_at', { ascending: false })
          .limit(20)
      ]);

      if (feedbackRes.error) throw feedbackRes.error;
      if (updatesRes.error) throw updatesRes.error;

      setFeedbacks(feedbackRes.data || []);
      setUpdates(updatesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription for feedback
    const channel = supabase
      .channel('feedback-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_feedback'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmitFeedback = async () => {
    if (!formTitle || !formDescription) {
      toast.error(language === 'id' ? 'Harap isi semua field' : 'Please fill all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          feedback_type: formType as "bug_report" | "feature_request" | "general_feedback" | "complaint",
          severity: formSeverity,
          title: formTitle,
          description: formDescription,
          user_id: user?.id,
          page_url: window.location.href,
          browser_info: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform
          }
        });

      if (error) throw error;

      toast.success(language === 'id' ? 'Umpan balik terkirim!' : 'Feedback submitted!');
      setShowSubmitDialog(false);
      setFormTitle("");
      setFormDescription("");
      fetchData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(language === 'id' ? 'Gagal mengirim' : 'Failed to submit');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      new: { variant: "secondary", icon: <Bell className="h-3 w-3" /> },
      reviewing: { variant: "outline", icon: <Eye className="h-3 w-3" /> },
      in_progress: { variant: "default", icon: <Clock className="h-3 w-3" /> },
      resolved: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      closed: { variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> }
    };
    const config = variants[status] || variants.new;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    };
    return <Badge className={colors[severity] || colors.medium}>{severity}</Badge>;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const stats = {
    totalFeedback: feedbacks.length,
    openBugs: feedbacks.filter(f => f.feedback_type === 'bug_report' && f.status !== 'resolved').length,
    pendingUpdates: updates.filter(u => u.status === 'planned').length,
    healthScore: Math.round(healthMetrics.reduce((sum, m) => sum + (m.status === 'healthy' ? 100 : m.status === 'degraded' ? 50 : 0), 0) / healthMetrics.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            {t.pageTitle}
          </h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t.refresh}
          </Button>
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Send className="h-4 w-4 mr-1" />
                {t.submitFeedback}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.submitFeedback}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.feedbackType}</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug_report">{t.bugReport}</SelectItem>
                        <SelectItem value="feature_request">{t.featureRequest}</SelectItem>
                        <SelectItem value="general_feedback">{t.generalFeedback}</SelectItem>
                        <SelectItem value="complaint">{t.complaint}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.severity}</Label>
                    <Select value={formSeverity} onValueChange={setFormSeverity}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t.low}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="high">{t.high}</SelectItem>
                        <SelectItem value="critical">{t.critical}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>{t.feedbackTitle}</Label>
                  <Input 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t.description}</Label>
                  <Textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleSubmitFeedback} className="w-full">
                  {t.submit}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">{t.totalFeedback}</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats.totalFeedback}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-300">{t.openBugs}</span>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">{stats.openBugs}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">{t.pendingUpdates}</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{stats.pendingUpdates}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">{t.systemHealth}</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{stats.healthScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-1" />
            {t.feedbackTab}
          </TabsTrigger>
          <TabsTrigger value="bugs">
            <Bug className="h-4 w-4 mr-1" />
            {t.bugsTab}
          </TabsTrigger>
          <TabsTrigger value="updates">
            <Zap className="h-4 w-4 mr-1" />
            {t.updatesTab}
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="h-4 w-4 mr-1" />
            {t.healthTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.feedbackTab}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noData}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.feedbackTitle}</TableHead>
                        <TableHead>{t.feedbackType}</TableHead>
                        <TableHead>{t.severity}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>{t.date}</TableHead>
                        <TableHead>{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbacks.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell className="font-medium">{feedback.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{feedback.feedback_type.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>{getSeverityBadge(feedback.severity)}</TableCell>
                          <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                          <TableCell>{new Date(feedback.created_at).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                {t.bugsTab}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks.filter(f => f.feedback_type === 'bug_report').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noData}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.feedbackTitle}</TableHead>
                        <TableHead>{t.severity}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>{t.date}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbacks.filter(f => f.feedback_type === 'bug_report').map((bug) => (
                        <TableRow key={bug.id}>
                          <TableCell className="font-medium">{bug.title}</TableCell>
                          <TableCell>{getSeverityBadge(bug.severity)}</TableCell>
                          <TableCell>{getStatusBadge(bug.status)}</TableCell>
                          <TableCell>{new Date(bug.created_at).toLocaleDateString('id-ID')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {t.updatesTab}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noData}</div>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <Card key={update.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{update.version}</Badge>
                              <Badge>{update.update_type}</Badge>
                              {update.downtime_expected && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Downtime
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold">
                              {language === 'id' ? update.title_id || update.title : update.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === 'id' ? update.description_id || update.description : update.description}
                            </p>
                          </div>
                          <Badge variant={update.status === 'completed' ? 'default' : 'secondary'}>
                            {update.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthMetrics.map((metric, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{metric.component}</span>
                    <Badge className={`${getHealthStatusColor(metric.status)} bg-transparent`}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">{metric.value}</span>
                    <span className="text-muted-foreground mb-1">{metric.unit}</span>
                  </div>
                  <Progress 
                    value={metric.component === 'api' ? 100 - (metric.value / 10) : metric.value} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackBugSystem;
