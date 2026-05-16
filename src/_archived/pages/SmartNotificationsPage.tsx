import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartNotifications, SmartNotificationResult, PersonalizedAlert } from "@/hooks/useSmartNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell, BellRing, Brain, Clock, Mail, MessageSquare, Smartphone,
  TrendingUp, TrendingDown, Target, Zap, Shield, BarChart3,
  ArrowLeft, Loader2, Sparkles, AlertTriangle, CheckCircle2, Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const ALERT_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  price_drop: { icon: TrendingDown, color: "text-green-500" },
  new_listing: { icon: Sparkles, color: "text-blue-500" },
  market_trend: { icon: TrendingUp, color: "text-purple-500" },
  investment_opportunity: { icon: Target, color: "text-amber-500" },
  viewing_reminder: { icon: Eye, color: "text-cyan-500" },
  similar_property: { icon: BarChart3, color: "text-indigo-500" },
  price_milestone: { icon: Zap, color: "text-orange-500" },
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
};

const CHANNEL_ICON: Record<string, React.ElementType> = {
  push: Smartphone,
  email: Mail,
  sms: MessageSquare,
  in_app: Bell,
};

export default function SmartNotificationsPage() {
  const { user } = useAuth();
  const mutation = useSmartNotifications();
  const [result, setResult] = useState<SmartNotificationResult | null>(null);

  // User behavior inputs
  const [searchFrequency, setSearchFrequency] = useState("daily");
  const [totalViews, setTotalViews] = useState(25);
  const [savedProps, setSavedProps] = useState(5);
  const [inquiries, setInquiries] = useState(2);
  const [channels, setChannels] = useState<string[]>(["push", "email", "in_app"]);
  const [frequency, setFrequency] = useState("balanced");
  const [quietStart, setQuietStart] = useState(22);
  const [quietEnd, setQuietEnd] = useState(7);

  // Notification history
  const [openRate, setOpenRate] = useState(45);
  const [clickRate, setClickRate] = useState(15);

  const handleAnalyze = async () => {
    if (!user) return;
    const data = await mutation.mutateAsync({
      user_id: user.id,
      user_behavior: {
        avg_active_hours: [9, 10, 12, 13, 18, 19, 20, 21],
        most_viewed_types: ["house", "apartment", "villa"],
        most_viewed_cities: ["Jakarta", "Bali", "Bandung"],
        search_frequency: searchFrequency,
        price_range: { min: 500000000, max: 5000000000 },
        total_views_30d: totalViews,
        saved_properties: savedProps,
        inquiries_sent: inquiries,
      },
      notification_history: {
        total_sent_30d: 24,
        open_rate: openRate / 100,
        click_rate: clickRate / 100,
        unsubscribe_rate: 0.02,
        most_engaged_types: ["price_drop", "new_listing"],
      },
      preferences: {
        channels,
        frequency,
        quiet_hours: { start: quietStart, end: quietEnd },
      },
    });
    setResult(data);
  };

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Smart Notifications</h1>
              <p className="text-xs text-muted-foreground">Personalized alerts powered by behavioral AI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Behavior Profile */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Your Activity Profile
                  </CardTitle>
                  <CardDescription>Tell us about your browsing behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Search Frequency</label>
                    <Select value={searchFrequency} onValueChange={setSearchFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_daily">Multiple times daily</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Properties Viewed (30 days): <span className="text-primary">{totalViews}</span>
                    </label>
                    <Slider value={[totalViews]} onValueChange={([v]) => setTotalViews(v)} min={0} max={200} step={1} />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Saved Properties: <span className="text-primary">{savedProps}</span>
                    </label>
                    <Slider value={[savedProps]} onValueChange={([v]) => setSavedProps(v)} min={0} max={50} step={1} />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Inquiries Sent: <span className="text-primary">{inquiries}</span>
                    </label>
                    <Slider value={[inquiries]} onValueChange={([v]) => setInquiries(v)} min={0} max={30} step={1} />
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Configure your notification channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Channels</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["push", "email", "sms", "in_app"] as const).map(ch => {
                        const Icon = CHANNEL_ICON[ch];
                        const active = channels.includes(ch);
                        return (
                          <button
                            key={ch}
                            onClick={() => toggleChannel(ch)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                              active ? "border-primary bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm capitalize">{ch.replace("_", " ")}</span>
                            <Switch checked={active} className="ml-auto" onCheckedChange={() => toggleChannel(ch)} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Frequency Preference</label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aggressive">Real-time (aggressive)</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="digest">Daily digest</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Quiet Hours: {quietStart}:00 – {quietEnd}:00
                    </label>
                    <div className="flex gap-4">
                      <Slider value={[quietStart]} onValueChange={([v]) => setQuietStart(v)} min={0} max={23} step={1} className="flex-1" />
                      <Slider value={[quietEnd]} onValueChange={([v]) => setQuietEnd(v)} min={0} max={23} step={1} className="flex-1" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Historical Open Rate: <span className="text-primary">{openRate}%</span>
                    </label>
                    <Slider value={[openRate]} onValueChange={([v]) => setOpenRate(v)} min={0} max={100} step={1} />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Historical Click Rate: <span className="text-primary">{clickRate}%</span>
                    </label>
                    <Slider value={[clickRate]} onValueChange={([v]) => setClickRate(v)} min={0} max={100} step={1} />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="lg:col-span-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={mutation.isPending || !user}
                  variant="cta"
                  size="lg"
                  className="w-full"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing behavior patterns…
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Generate AI Notification Strategy
                    </>
                  )}
                </Button>
                {!user && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Please sign in to use this feature.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Back + Summary */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> New Analysis
                </Button>
              </div>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="timing" className="space-y-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="timing"><Clock className="h-3 w-3 mr-1" /> Timing</TabsTrigger>
                  <TabsTrigger value="alerts"><BellRing className="h-3 w-3 mr-1" /> Alerts</TabsTrigger>
                  <TabsTrigger value="channels"><Smartphone className="h-3 w-3 mr-1" /> Channels</TabsTrigger>
                  <TabsTrigger value="insights"><Brain className="h-3 w-3 mr-1" /> Insights</TabsTrigger>
                </TabsList>

                {/* Optimal Timing */}
                <TabsContent value="timing" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-border/40">
                      <CardHeader>
                        <CardTitle className="text-sm">Optimal Send Times</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.optimal_send_times.map((time, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{time.hour}:00</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground capitalize">{time.day_of_week}</span>
                                <Badge variant="outline" className="text-xs">{Math.round(time.confidence * 100)}% confidence</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{time.reasoning}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border/40">
                      <CardHeader>
                        <CardTitle className="text-sm">Recommended Frequency</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-lg bg-muted/30 text-center">
                            <p className="text-2xl font-bold text-primary">{result.recommended_frequency.daily_max}</p>
                            <p className="text-xs text-muted-foreground">Max / Day</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30 text-center">
                            <p className="text-2xl font-bold text-primary">{result.recommended_frequency.weekly_max}</p>
                            <p className="text-xs text-muted-foreground">Max / Week</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.recommended_frequency.reasoning}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Personalized Alerts */}
                <TabsContent value="alerts" className="space-y-3">
                  {result.personalized_alerts.map((alert, i) => {
                    const config = ALERT_TYPE_CONFIG[alert.alert_type] || { icon: Bell, color: "text-primary" };
                    const Icon = config.icon;
                    const ChIcon = CHANNEL_ICON[alert.recommended_channel] || Bell;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="border-border/40">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-muted/50 ${config.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                                  <Badge className={`text-xs border ${PRIORITY_BADGE[alert.priority]}`}>{alert.priority}</Badge>
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <ChIcon className="h-3 w-3" /> {alert.recommended_channel.replace("_", " ")}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Trigger: <span className="text-foreground">{alert.trigger_condition}</span>
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">Relevance:</span>
                                    <Progress value={alert.estimated_relevance_score * 100} className="w-16 h-1.5" />
                                    <span className="text-xs text-primary font-medium">{Math.round(alert.estimated_relevance_score * 100)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </TabsContent>

                {/* Channel Optimization */}
                <TabsContent value="channels">
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle className="text-sm">Channel Performance Scores</CardTitle>
                      <CardDescription>{result.channel_optimization.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(result.channel_optimization.channel_scores).map(([ch, score]) => {
                        const ChIcon = CHANNEL_ICON[ch] || Bell;
                        const isPrimary = ch === result.channel_optimization.primary_channel;
                        return (
                          <div key={ch} className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isPrimary ? "bg-primary/10" : "bg-muted/30"}`}>
                              <ChIcon className={`h-4 w-4 ${isPrimary ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <span className="text-sm font-medium capitalize w-16 text-foreground">{ch.replace("_", " ")}</span>
                            <Progress value={score * 100} className="flex-1 h-2" />
                            <span className="text-sm font-bold text-foreground w-12 text-right">{Math.round(score * 100)}%</span>
                            {isPrimary && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Primary</Badge>}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Engagement Insights */}
                <TabsContent value="insights">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-border/40">
                      <CardHeader>
                        <CardTitle className="text-sm">Engagement Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            result.engagement_insights.engagement_level === "highly_engaged" ? "bg-green-500/10" :
                            result.engagement_insights.engagement_level === "moderately_engaged" ? "bg-amber-500/10" :
                            "bg-red-500/10"
                          }`}>
                            {result.engagement_insights.engagement_level === "highly_engaged" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : result.engagement_insights.engagement_level === "at_risk" ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Target className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground capitalize">
                              {result.engagement_insights.engagement_level.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">Current engagement level</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Churn Risk</span>
                            <span className="font-medium text-foreground">{Math.round(result.engagement_insights.churn_risk * 100)}%</span>
                          </div>
                          <Progress value={result.engagement_insights.churn_risk * 100} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Notification Fatigue Risk</span>
                            <Badge className={`text-xs ${
                              result.engagement_insights.fatigue_risk === "low" ? "bg-green-500/10 text-green-500" :
                              result.engagement_insights.fatigue_risk === "high" ? "bg-red-500/10 text-red-500" :
                              "bg-amber-500/10 text-amber-500"
                            }`}>
                              {result.engagement_insights.fatigue_risk}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/40">
                      <CardHeader>
                        <CardTitle className="text-sm">Re-engagement Strategy</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{result.engagement_insights.re_engagement_strategy}</p>
                        <div>
                          <p className="text-xs font-medium text-foreground mb-2">Content Preferences</p>
                          <div className="flex flex-wrap gap-2">
                            {result.engagement_insights.content_preferences.map((pref, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{pref}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
