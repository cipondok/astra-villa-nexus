import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Smartphone, Monitor, Tablet, LogOut, Clock,
  MapPin, AlertTriangle, CheckCircle, ShieldCheck, Activity,
  Globe, Trash2, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_info: string | null;
  risk_level: string;
  created_at: string;
}

interface SessionInfo {
  id: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  last_activity_at: string;
  is_current: boolean | null;
  created_at: string;
  device_fingerprint: string | null;
}

const riskColors: Record<string, string> = {
  low: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
};

const eventIcons: Record<string, typeof Shield> = {
  login_success: CheckCircle,
  account_locked: AlertTriangle,
  session_revoked: LogOut,
  all_sessions_revoked: Trash2,
  password_changed: ShieldCheck,
};

const deviceIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const SecurityActivityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("timeline");

  // Fetch security events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["security-events", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("auth-engine", {
        body: { action: "get_security_events", limit: 100 },
      });
      if (error) throw error;
      return (data?.events || []) as SecurityEvent[];
    },
    enabled: !!user,
  });

  // Fetch active sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["user-sessions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("auth-engine", {
        body: { action: "get_user_sessions" },
      });
      if (error) throw error;
      return (data?.sessions || []) as SessionInfo[];
    },
    enabled: !!user,
  });

  // Revoke single session
  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke("auth-engine", {
        body: { action: "revoke_session", session_id: sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Session revoked", description: "Device has been logged out." });
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["security-events"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  // Revoke all sessions
  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("auth-engine", {
        body: { action: "revoke_all_sessions", current_fingerprint: "" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "All sessions revoked", description: "All other devices have been logged out." });
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["security-events"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <SEOHead title="Security Activity — Astra Villa" description="Monitor your account security" />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Security Activity</h1>
              <p className="text-xs text-muted-foreground">
                Your account is protected by multi-layer security
              </p>
            </div>
          </div>

          {/* Trust banner */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Account Protected</p>
                <p className="text-[11px] text-muted-foreground">
                  Server-enforced lockout • Progressive rate limiting • Device tracking • Anomaly detection
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9 bg-muted/50 mb-4">
              <TabsTrigger value="timeline" className="text-xs gap-1.5">
                <Activity className="h-3.5 w-3.5" /> Activity Timeline
              </TabsTrigger>
              <TabsTrigger value="devices" className="text-xs gap-1.5">
                <Smartphone className="h-3.5 w-3.5" /> Active Devices
                {sessions.length > 0 && (
                  <Badge variant="secondary" className="text-[8px] h-4 px-1 ml-1">{sessions.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Security Timeline */}
            <TabsContent value="timeline" className="space-y-3">
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}><CardContent className="p-4"><div className="h-12 bg-muted animate-pulse rounded" /></CardContent></Card>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Shield className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No security events recorded yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />

                  <div className="space-y-3">
                    {events.map((event) => {
                      const Icon = eventIcons[event.event_type] || Activity;
                      const riskClass = riskColors[event.risk_level] || riskColors.low;

                      return (
                        <div key={event.id} className="relative flex gap-3 pl-1">
                          {/* Timeline dot */}
                          <div className={`relative z-10 p-1.5 rounded-full border ${riskClass} shrink-0`}>
                            <Icon className="h-3 w-3" />
                          </div>

                          <Card className="flex-1 border shadow-sm">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-xs font-semibold capitalize">
                                      {event.event_type.replace(/_/g, " ")}
                                    </p>
                                    <Badge className={`text-[8px] ${riskClass}`}>
                                      {event.risk_level}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">{event.description}</p>
                                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                    {event.ip_address && (
                                      <span className="flex items-center gap-0.5">
                                        <Globe className="h-2.5 w-2.5" /> {event.ip_address}
                                      </span>
                                    )}
                                    {event.country && (
                                      <span className="flex items-center gap-0.5">
                                        <MapPin className="h-2.5 w-2.5" /> {event.country}{event.city ? `, ${event.city}` : ""}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  {formatTime(event.created_at)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Active Devices */}
            <TabsContent value="devices" className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">
                  {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
                </p>
                {sessions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] text-destructive"
                    onClick={() => revokeAllMutation.mutate()}
                    disabled={revokeAllMutation.isPending}
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Log out all other devices
                  </Button>
                )}
              </div>

              {sessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i}><CardContent className="p-4"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No active sessions found</p>
                  </CardContent>
                </Card>
              ) : (
                sessions.map((session) => {
                  const DeviceIcon = deviceIcons[session.device_type || "desktop"] || Monitor;
                  const isCurrent = session.is_current;

                  return (
                    <Card key={session.id} className={`border ${isCurrent ? "border-primary/30 bg-primary/5" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCurrent ? "bg-primary/10" : "bg-muted"}`}>
                              <DeviceIcon className={`h-4 w-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  {session.device_name || "Unknown Device"}
                                </p>
                                {isCurrent && (
                                  <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20">
                                    This device
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                {session.browser && <span>{session.browser}</span>}
                                {session.os && <span>• {session.os}</span>}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                                <Clock className="h-2.5 w-2.5" />
                                Last active: {formatTime(session.last_activity_at)}
                              </div>
                            </div>
                          </div>

                          {!isCurrent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px] text-destructive hover:bg-destructive/10"
                              onClick={() => revokeMutation.mutate(session.id)}
                              disabled={revokeMutation.isPending}
                            >
                              <LogOut className="h-3 w-3 mr-1" />
                              Log out
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SecurityActivityPage;
