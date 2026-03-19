import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Mail, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, subHours } from "date-fns";

type TimeRange = "24h" | "7d" | "30d";
type StatusFilter = "all" | "sent" | "failed" | "pending" | "suppressed";

const STATUS_BADGE: Record<string, { className: string; icon: typeof CheckCircle; label: string }> = {
  sent: { className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", icon: CheckCircle, label: "Sent" },
  pending: { className: "bg-blue-500/15 text-blue-600 border-blue-500/20", icon: Clock, label: "Pending" },
  failed: { className: "bg-destructive/15 text-destructive border-destructive/20", icon: XCircle, label: "Failed" },
  dlq: { className: "bg-destructive/15 text-destructive border-destructive/20", icon: XCircle, label: "Failed" },
  suppressed: { className: "bg-amber-500/15 text-amber-600 border-amber-500/20", icon: AlertTriangle, label: "Suppressed" },
  bounced: { className: "bg-destructive/15 text-destructive border-destructive/20", icon: XCircle, label: "Bounced" },
  complained: { className: "bg-amber-500/15 text-amber-600 border-amber-500/20", icon: AlertTriangle, label: "Complained" },
};

const PAGE_SIZE = 50;

function getDateRange(range: TimeRange) {
  const end = new Date();
  switch (range) {
    case "24h": return { start: subHours(end, 24), end };
    case "7d": return { start: subDays(end, 7), end };
    case "30d": return { start: subDays(end, 30), end };
  }
}

export default function EmailMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { start, end } = useMemo(() => getDateRange(timeRange), [timeRange]);
  const rpcStatus = statusFilter === "failed" ? "dlq" : statusFilter === "all" ? null : statusFilter;
  const rpcTemplate = templateFilter === "all" ? null : templateFilter;

  // Fetch stats (server-side deduplicated)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["email-stats", timeRange, statusFilter, templateFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_email_log_stats", {
        p_start: start.toISOString(),
        p_end: end.toISOString(),
        p_template: rpcTemplate,
        p_status: rpcStatus,
      });
      if (error) throw error;
      return (data as any)?.[0] || { total_count: 0, sent_count: 0, failed_count: 0, suppressed_count: 0, pending_count: 0 };
    },
  });

  // Fetch log entries (server-side deduplicated + paginated)
  const { data: entries, isLoading: entriesLoading, refetch: refetchEntries } = useQuery({
    queryKey: ["email-entries", timeRange, statusFilter, templateFilter, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_email_log_entries", {
        p_start: start.toISOString(),
        p_end: end.toISOString(),
        p_template: rpcTemplate,
        p_status: rpcStatus,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  // Fetch template names for filter dropdown
  const { data: templateNames } = useQuery({
    queryKey: ["email-template-names"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_email_template_names");
      if (error) throw error;
      return (data as any[])?.map((d: any) => d.template_name) || [];
    },
    staleTime: 60000,
  });

  const isLoading = statsLoading || entriesLoading;
  const refetch = () => { refetchStats(); refetchEntries(); };

  const statCards = [
    { label: "Total", value: stats?.total_count ?? 0, icon: <Mail className="h-4 w-4 text-primary" /> },
    { label: "Sent", value: stats?.sent_count ?? 0, icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
    { label: "Failed", value: stats?.failed_count ?? 0, icon: <XCircle className="h-4 w-4 text-destructive" /> },
    { label: "Pending", value: stats?.pending_count ?? 0, icon: <Clock className="h-4 w-4 text-blue-500" /> },
    { label: "Suppressed", value: stats?.suppressed_count ?? 0, icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Email Monitor</h2>
            <p className="text-sm text-muted-foreground">Track delivery, failures, and performance</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["24h", "7d", "30d"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => { setTimeRange(range); setPage(0); }}
            >
              {range === "24h" ? "24 Hours" : range === "7d" ? "7 Days" : "30 Days"}
            </Button>
          ))}
        </div>

        <Select value={templateFilter} onValueChange={(v) => { setTemplateFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All templates</SelectItem>
            {(templateNames || []).map((name: string) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setPage(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suppressed">Suppressed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Email Log Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : !entries?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No emails found for this time range.</TableCell>
                </TableRow>
              ) : (
                entries.map((log: any) => {
                  const badge = STATUS_BADGE[log.status] || { className: "bg-muted text-muted-foreground", icon: Mail, label: log.status };
                  const Icon = badge.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.template_name || "—"}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{log.recipient_email || "—"}</TableCell>
                      <TableCell>
                        <Badge className={badge.className} variant="secondary">
                          <Icon className="h-3 w-3 mr-1" />{badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                        {log.error_message || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {page + 1} · {entries?.length ?? 0} results
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={(entries?.length ?? 0) < PAGE_SIZE} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
