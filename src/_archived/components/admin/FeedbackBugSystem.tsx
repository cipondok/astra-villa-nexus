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
import { useTranslation } from "@/i18n/useTranslation";
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

const FeedbackBugSystem = () => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  const [formType, setFormType] = useState("general_feedback");
  const [formSeverity, setFormSeverity] = useState("medium");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

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
      toast.error(t('feedbackSystem.fillAllFields'));
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

      toast.success(t('feedbackSystem.feedbackSubmitted'));
      setShowSubmitDialog(false);
      setFormTitle("");
      setFormDescription("");
      fetchData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('feedbackSystem.failedToSubmit'));
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
      low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      high: "bg-chart-4/10 text-chart-4 border-chart-4/20",
      critical: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return <Badge className={colors[severity] || colors.medium}>{severity}</Badge>;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-chart-1';
      case 'degraded': return 'text-chart-3';
      case 'down': return 'text-destructive';
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
            {t('feedbackSystem.pageTitle')}
          </h2>
          <p className="text-muted-foreground">{t('feedbackSystem.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('feedbackSystem.refresh')}
          </Button>
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Send className="h-4 w-4 mr-1" />
                {t('feedbackSystem.submitFeedback')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('feedbackSystem.submitFeedback')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('feedbackSystem.feedbackType')}</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug_report">{t('feedbackSystem.bugReport')}</SelectItem>
                        <SelectItem value="feature_request">{t('feedbackSystem.featureRequest')}</SelectItem>
                        <SelectItem value="general_feedback">{t('feedbackSystem.generalFeedback')}</SelectItem>
                        <SelectItem value="complaint">{t('feedbackSystem.complaint')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('feedbackSystem.severity')}</Label>
                    <Select value={formSeverity} onValueChange={setFormSeverity}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('feedbackSystem.low')}</SelectItem>
                        <SelectItem value="medium">{t('feedbackSystem.medium')}</SelectItem>
                        <SelectItem value="high">{t('feedbackSystem.high')}</SelectItem>
                        <SelectItem value="critical">{t('feedbackSystem.critical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>{t('feedbackSystem.feedbackTitle')}</Label>
                  <Input 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('feedbackSystem.description')}</Label>
                  <Textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleSubmitFeedback} className="w-full">
                  {t('feedbackSystem.submit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-chart-2/5 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-chart-2" />
              <span className="text-sm text-chart-2">{t('feedbackSystem.totalFeedback')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalFeedback}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{t('feedbackSystem.openBugs')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.openBugs}</p>
          </CardContent>
        </Card>

        <Card className="bg-chart-3/5 border-chart-3/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-chart-3" />
              <span className="text-sm text-chart-3">{t('feedbackSystem.pendingUpdates')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.pendingUpdates}</p>
          </CardContent>
        </Card>

        <Card className="bg-chart-1/5 border-chart-1/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-1" />
              <span className="text-sm text-chart-1">{t('feedbackSystem.systemHealth')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.healthScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-1" />
            {t('feedbackSystem.feedbackTab')}
          </TabsTrigger>
          <TabsTrigger value="bugs">
            <Bug className="h-4 w-4 mr-1" />
            {t('feedbackSystem.bugsTab')}
          </TabsTrigger>
          <TabsTrigger value="updates">
            <Zap className="h-4 w-4 mr-1" />
            {t('feedbackSystem.updatesTab')}
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="h-4 w-4 mr-1" />
            {t('feedbackSystem.healthTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('feedbackSystem.feedbackTab')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('feedbackSystem.loading')}</div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('feedbackSystem.noData')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('feedbackSystem.feedbackTitle')}</TableHead>
                        <TableHead>{t('feedbackSystem.feedbackType')}</TableHead>
                        <TableHead>{t('feedbackSystem.severity')}</TableHead>
                        <TableHead>{t('feedbackSystem.status')}</TableHead>
                        <TableHead>{t('feedbackSystem.date')}</TableHead>
                        <TableHead>{t('feedbackSystem.actions')}</TableHead>
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
                <Bug className="h-5 w-5 text-destructive" />
                {t('feedbackSystem.bugsTab')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks.filter(f => f.feedback_type === 'bug_report').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('feedbackSystem.noData')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('feedbackSystem.feedbackTitle')}</TableHead>
                        <TableHead>{t('feedbackSystem.severity')}</TableHead>
                        <TableHead>{t('feedbackSystem.status')}</TableHead>
                        <TableHead>{t('feedbackSystem.date')}</TableHead>
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
                <Zap className="h-5 w-5 text-chart-3" />
                {t('feedbackSystem.updatesTab')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('feedbackSystem.noData')}</div>
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
