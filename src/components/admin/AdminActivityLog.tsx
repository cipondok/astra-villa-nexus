import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Shield, Settings, Users, Database, Eye, Edit, Trash2, Clock, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const activityIcons: Record<string, typeof Shield> = {
  login: Shield, settings_change: Settings, user_action: Users,
  data_modification: Database, view: Eye, edit: Edit, delete: Trash2,
};

const AdminActivityLog = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-activity-logs", typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (typeFilter !== "all") {
        query = query.eq("activity_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = (logs || []).filter(log =>
    !search || log.activity_description?.toLowerCase().includes(search.toLowerCase()) ||
    log.activity_type?.toLowerCase().includes(search.toLowerCase())
  );

  const typeCounts = (logs || []).reduce((acc, log) => {
    acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Admin Activity Log</h2>
          <p className="text-sm text-muted-foreground">Real-time admin actions and system events</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Activity className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Events</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-2xl font-bold text-foreground">{Object.keys(typeCounts).length}</p>
          <p className="text-[10px] text-muted-foreground">Event Types</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-2xl font-bold text-foreground">{new Set((logs || []).map(l => l.user_id)).size}</p>
          <p className="text-[10px] text-muted-foreground">Unique Users</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{(logs || []).filter(l => l.activity_type === "security").length}</p>
          <p className="text-[10px] text-muted-foreground">Security Events</p>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search activity..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/40">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading activity logs...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No activity logs found</div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.slice(0, 50).map((log) => {
                const Icon = activityIcons[log.activity_type] || Activity;
                return (
                  <div key={log.id} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
                    <div className="p-1.5 rounded bg-muted/40 shrink-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{log.activity_description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[9px]">{log.activity_type}</Badge>
                        <span className="text-[10px] text-muted-foreground">{log.user_id?.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {format(new Date(log.created_at), "MMM d, HH:mm")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityLog;
