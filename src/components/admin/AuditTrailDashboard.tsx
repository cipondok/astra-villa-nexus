import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Search, Download, Clock, User, Activity, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const activityTypeColors: Record<string, string> = {
  login: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  logout: "bg-muted text-muted-foreground",
  property_create: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  property_update: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  property_delete: "bg-destructive/15 text-destructive",
  user_update: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  settings_change: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  kyc_review: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
};

const AuditTrailDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["audit-trail", typeFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (typeFilter !== "all") {
        query = query.eq("activity_type", typeFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { logs: data || [], total: count || 0 };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["audit-trail-stats"],
    queryFn: async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

      const [todayRes, weekRes, totalRes] = await Promise.all([
        supabase.from("activity_logs").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("activity_logs").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("activity_logs").select("id", { count: "exact", head: true }),
      ]);

      return {
        today: todayRes.count || 0,
        thisWeek: weekRes.count || 0,
        total: totalRes.count || 0,
      };
    },
  });

  const filteredLogs = (logs?.logs || []).filter(
    (log) =>
      !searchTerm ||
      log.activity_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const csv = [
      "Timestamp,Type,Description,User ID,IP",
      ...filteredLogs.map((l) =>
        [
          l.created_at,
          l.activity_type,
          `"${(l.activity_description || "").replace(/"/g, '""')}"`,
          l.user_id,
          l.ip_address || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil((logs?.total || 0) / pageSize);

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Audit Trail</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today", value: stats?.today || 0, icon: Clock },
          { label: "This Week", value: stats?.thisWeek || 0, icon: Activity },
          { label: "Total Logs", value: stats?.total || 0, icon: Shield },
        ].map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="property_create">Property Create</SelectItem>
            <SelectItem value="property_update">Property Update</SelectItem>
            <SelectItem value="property_delete">Property Delete</SelectItem>
            <SelectItem value="user_update">User Update</SelectItem>
            <SelectItem value="settings_change">Settings Change</SelectItem>
            <SelectItem value="kyc_review">KYC Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log entries */}
      <Card className="border-border/40">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm text-muted-foreground">
            {logs?.total || 0} log entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading audit logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No audit logs found</div>
            ) : (
              <div className="divide-y divide-border/30">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="mt-0.5 p-1.5 rounded-md bg-muted/50">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-1.5 ${activityTypeColors[log.activity_type] || "bg-muted text-muted-foreground"}`}>
                          {log.activity_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "MMM dd, HH:mm:ss")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5 truncate">{log.activity_description}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                        User: {log.user_id?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/30">
              <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrailDashboard;
