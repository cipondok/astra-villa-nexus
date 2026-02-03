import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FlaskConical, Flag, BarChart3, MessageSquare, Target, 
  Play, Pause, CheckCircle, XCircle, TrendingUp, Users,
  Zap, PieChart, ThumbsUp, ThumbsDown, Plus, Settings
} from "lucide-react";

const InnovationLabManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("experiments");
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [showNewFlag, setShowNewFlag] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: "",
    hypothesis: "",
    primary_metric: "conversion_rate",
    target_sample_size: 1000
  });
  const [newFlag, setNewFlag] = useState({
    flag_key: "",
    name: "",
    description: "",
    flag_type: "boolean",
    percentage_rollout: 0
  });

  // Fetch experiments
  const { data: experiments = [] } = useQuery({
    queryKey: ["innovation-experiments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("innovation_experiments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch feature flags
  const { data: featureFlags = [] } = useQuery({
    queryKey: ["innovation-feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("innovation_feature_flags")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch user feedback
  const { data: feedback = [] } = useQuery({
    queryKey: ["innovation-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("innovation_user_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  // Fetch metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ["innovation-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("innovation_feature_metrics")
        .select("*, innovation_feature_flags(name)")
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    }
  });

  // Create experiment mutation
  const createExperiment = useMutation({
    mutationFn: async (exp: typeof newExperiment) => {
      const { error } = await supabase.from("innovation_experiments").insert({
        ...exp,
        status: "draft",
        control_variant: { name: "control", weight: 50 },
        test_variants: [{ name: "variant_a", weight: 50 }]
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["innovation-experiments"] });
      toast({ title: "Experiment Created", description: "New A/B test is ready to configure" });
      setShowNewExperiment(false);
      setNewExperiment({ name: "", hypothesis: "", primary_metric: "conversion_rate", target_sample_size: 1000 });
    }
  });

  // Create feature flag mutation
  const createFeatureFlag = useMutation({
    mutationFn: async (flag: typeof newFlag) => {
      const { error } = await supabase.from("innovation_feature_flags").insert({
        ...flag,
        is_enabled: false
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["innovation-feature-flags"] });
      toast({ title: "Feature Flag Created" });
      setShowNewFlag(false);
      setNewFlag({ flag_key: "", name: "", description: "", flag_type: "boolean", percentage_rollout: 0 });
    }
  });

  // Toggle feature flag
  const toggleFlag = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("innovation_feature_flags")
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["innovation-feature-flags"] });
      toast({ title: "Flag Updated" });
    }
  });

  // Update rollout percentage
  const updateRollout = useMutation({
    mutationFn: async ({ id, percentage }: { id: string; percentage: number }) => {
      const { error } = await supabase
        .from("innovation_feature_flags")
        .update({ percentage_rollout: percentage, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["innovation-feature-flags"] });
    }
  });

  // Update experiment status
  const updateExperimentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (status === "running") updates.start_date = new Date().toISOString();
      if (status === "completed" || status === "failed") updates.end_date = new Date().toISOString();
      
      const { error } = await supabase.from("innovation_experiments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["innovation-experiments"] });
      toast({ title: "Experiment Updated" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "failed": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "bug": return <XCircle className="h-4 w-4 text-red-500" />;
      case "feature_request": return <Zap className="h-4 w-4 text-blue-500" />;
      case "improvement": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "praise": return <ThumbsUp className="h-4 w-4 text-yellow-500" />;
      case "complaint": return <ThumbsDown className="h-4 w-4 text-orange-500" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Stats
  const runningExperiments = experiments.filter(e => e.status === "running").length;
  const activeFlags = featureFlags.filter(f => f.is_enabled).length;
  const newFeedback = feedback.filter(f => f.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Innovation Lab
          </h2>
          <p className="text-muted-foreground">A/B testing, feature flags, and experimentation platform</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Play className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Running Tests</p>
                <p className="text-2xl font-bold">{runningExperiments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Flags</p>
                <p className="text-2xl font-bold">{activeFlags}/{featureFlags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users Tested</p>
                <p className="text-2xl font-bold">{experiments.reduce((sum, e) => sum + (e.current_sample_size || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Feedback</p>
                <p className="text-2xl font-bold">{newFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden md:inline">Experiments</span>
          </TabsTrigger>
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <span className="hidden md:inline">Feature Flags</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Metrics</span>
          </TabsTrigger>
        </TabsList>

        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewExperiment} onOpenChange={setShowNewExperiment}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Experiment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create A/B Test</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Experiment Name</Label>
                    <Input
                      value={newExperiment.name}
                      onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                      placeholder="e.g., New CTA Button Color"
                    />
                  </div>
                  <div>
                    <Label>Hypothesis</Label>
                    <Textarea
                      value={newExperiment.hypothesis}
                      onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                      placeholder="We believe that... will result in..."
                    />
                  </div>
                  <div>
                    <Label>Primary Metric</Label>
                    <Select
                      value={newExperiment.primary_metric}
                      onValueChange={(v) => setNewExperiment({ ...newExperiment, primary_metric: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                        <SelectItem value="click_through_rate">Click-Through Rate</SelectItem>
                        <SelectItem value="engagement_time">Engagement Time</SelectItem>
                        <SelectItem value="bounce_rate">Bounce Rate</SelectItem>
                        <SelectItem value="revenue_per_user">Revenue per User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Sample Size</Label>
                    <Input
                      type="number"
                      value={newExperiment.target_sample_size}
                      onChange={(e) => setNewExperiment({ ...newExperiment, target_sample_size: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createExperiment.mutate(newExperiment)}
                    disabled={!newExperiment.name || createExperiment.isPending}
                  >
                    Create Experiment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {experiments.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{exp.name}</h3>
                        <Badge className={getStatusColor(exp.status)}>{exp.status}</Badge>
                      </div>
                      {exp.hypothesis && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{exp.hypothesis}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {exp.primary_metric?.replace(/_/g, " ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {exp.current_sample_size || 0}/{exp.target_sample_size}
                        </span>
                        {exp.statistical_significance && (
                          <span className="flex items-center gap-1">
                            <PieChart className="h-3 w-3" />
                            {exp.statistical_significance}% significance
                          </span>
                        )}
                      </div>
                      {exp.target_sample_size && (
                        <Progress 
                          value={((exp.current_sample_size || 0) / exp.target_sample_size) * 100} 
                          className="mt-2 h-1"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {exp.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: "running" })}
                        >
                          <Play className="h-4 w-4 mr-1" />Start
                        </Button>
                      )}
                      {exp.status === "running" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: "paused" })}
                          >
                            <Pause className="h-4 w-4 mr-1" />Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: "completed" })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />Complete
                          </Button>
                        </>
                      )}
                      {exp.status === "paused" && (
                        <Button
                          size="sm"
                          onClick={() => updateExperimentStatus.mutate({ id: exp.id, status: "running" })}
                        >
                          <Play className="h-4 w-4 mr-1" />Resume
                        </Button>
                      )}
                      {exp.winner_variant && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Winner: {exp.winner_variant}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {experiments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No experiments yet. Create your first A/B test!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="flags" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewFlag} onOpenChange={setShowNewFlag}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Flag</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Feature Flag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Flag Key (unique identifier)</Label>
                    <Input
                      value={newFlag.flag_key}
                      onChange={(e) => setNewFlag({ ...newFlag, flag_key: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                      placeholder="e.g., new_checkout_flow"
                    />
                  </div>
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={newFlag.name}
                      onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                      placeholder="e.g., New Checkout Flow"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newFlag.description}
                      onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                      placeholder="What does this feature do?"
                    />
                  </div>
                  <div>
                    <Label>Flag Type</Label>
                    <Select
                      value={newFlag.flag_type}
                      onValueChange={(v) => setNewFlag({ ...newFlag, flag_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boolean">Boolean (On/Off)</SelectItem>
                        <SelectItem value="percentage">Percentage Rollout</SelectItem>
                        <SelectItem value="variant">Multi-Variant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newFlag.flag_type === "percentage" && (
                    <div>
                      <Label>Initial Rollout: {newFlag.percentage_rollout}%</Label>
                      <Slider
                        value={[newFlag.percentage_rollout]}
                        onValueChange={([v]) => setNewFlag({ ...newFlag, percentage_rollout: v })}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={() => createFeatureFlag.mutate(newFlag)}
                    disabled={!newFlag.flag_key || !newFlag.name || createFeatureFlag.isPending}
                  >
                    Create Flag
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {featureFlags.map((flag) => (
              <Card key={flag.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{flag.name}</h3>
                        <Badge variant="outline" className="font-mono text-xs">{flag.flag_key}</Badge>
                        <Badge variant="secondary">{flag.flag_type}</Badge>
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {flag.flag_type === "percentage" && flag.is_enabled && (
                        <div className="flex items-center gap-2 min-w-[180px]">
                          <Slider
                            value={[flag.percentage_rollout || 0]}
                            onValueChange={([v]) => updateRollout.mutate({ id: flag.id, percentage: v })}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12">{flag.percentage_rollout}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={flag.is_enabled}
                          onCheckedChange={(checked) => toggleFlag.mutate({ id: flag.id, enabled: checked })}
                        />
                        <span className="text-sm">{flag.is_enabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="grid gap-4">
            {feedback.map((fb) => (
              <Card key={fb.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getFeedbackIcon(fb.feedback_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{fb.feedback_type?.replace(/_/g, " ")}</span>
                        <Badge variant={fb.status === "new" ? "default" : "secondary"}>{fb.status}</Badge>
                        {fb.rating && (
                          <span className="text-sm text-muted-foreground">Rating: {fb.rating}/10</span>
                        )}
                      </div>
                      {fb.title && <h4 className="font-semibold">{fb.title}</h4>}
                      {fb.description && (
                        <p className="text-sm text-muted-foreground mt-1">{fb.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {feedback.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No user feedback collected yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {featureFlags.filter(f => f.is_enabled).map((flag) => (
              <Card key={flag.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flag className="h-4 w-4 text-primary" />
                    {flag.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rollout</p>
                      <p className="font-bold text-lg">{flag.percentage_rollout || 100}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{flag.flag_type}</p>
                    </div>
                  </div>
                  <Progress value={flag.percentage_rollout || 100} className="mt-3 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          {featureFlags.filter(f => f.is_enabled).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Enable feature flags to see adoption metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InnovationLabManagement;
