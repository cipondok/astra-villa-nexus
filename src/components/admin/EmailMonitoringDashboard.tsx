import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Mail, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { format, subDays, subHours } from "date-fns";

type TimeRange = "24h" | "7d" | "30d" | "custom";
type StatusFilter = "all" | "sent" | "failed" | "pending" | "suppressed";

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  dlq: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  suppressed: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  bounced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  complained: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const PAGE_SIZE = 50;

export default function EmailMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const startDate = useMemo(() => {
    switch (timeRange) {
      case "24h": return subHours(new Date(), 24);
      case "7d": return subDays(new Date(), 7);
      case "30d": return subDays(new Date(), 30);
      default: return subDays(new Date(), 7);
    }
  }, [timeRange]);

  // Fetch all logs for the time range (deduplicated by message_id in JS)
  const { data: rawLogs, isLoading, refetch } = useQuery({
    queryKey: ["email-logs", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_send_log")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data || [];
    },
  });

  // Deduplicate by message_id (keep latest status per message_id)
  const dedupedLogs = useMemo(() => {
    if (!rawLogs) return [];
    const byMessageId = new Map<string, any>();
    for (const log of rawLogs) {
      const key = log.message_id || log.id;
      if (!byMessageId.has(key)) {
        byMessageId.set(key, log);
      }
    }
    return Array.from(byMessageId.values());
  }, [rawLogs]);

  // Get distinct template names
  const templateNames = useMemo(() => {
    const names = new Set(dedupedLogs.map((l) => l.template_name).filter(Boolean));
    return Array.from(names).sort();
  }, [dedupedLogs]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    return dedupedLogs.filter((log) => {
      if (statusFilter !== "all") {
        if (statusFilter === "failed" && !["failed", "dlq"].includes(log.status)) return false;
        if (statusFilter !== "failed" && log.status !== statusFilter) return false;
      }
      if (templateFilter !== "all" && log.template_name !== templateFilter) return false;
      return true;
    });
  }, [dedupedLogs, statusFilter, templateFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = dedupedLogs.length;
    const sent = dedupedLogs.filter((l) => l.status === "sent").length;
    const failed = dedupedLogs.filter((l) => ["failed", "dlq"].includes(l.status)).length;
    const pending = dedupedLogs.filter((l) => l.status === "pending").length;
    const suppressed = dedupedLogs.filter((l) => ["suppressed", "bounced", "complained"].includes(l.status)).length;
    return { total, sent, failed, pending, suppressed };
  }, [dedupedLogs]);

  // Paginate
  const paginatedLogs = filteredLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Email Monitoring</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={<Mail className="h-4 w-4" />} />
        <StatCard label="Sent" value={stats.sent} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
        <StatCard label="Failed" value={stats.failed} icon={<XCircle className="h-4 w-4 text-red-500" />} />
        <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-4 w-4 text-yellow-500" />} />
        <StatCard label="Suppressed" value={stats.suppressed} icon={<AlertTriangle className="h-4 w-4 text-orange-500" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1">
          {(["24h", "7d", "30d"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => { setTimeRange(range); setPage(0); }}
            >
              {range === "24h" ? "Last 24h" : range === "7d" ? "Last 7 days" : "Last 30 days"}
            </Button>
          ))}
        </div>

        <Select value={templateFilter} onValueChange={(v) => { setTemplateFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All templates</SelectItem>
            {templateNames.map((name) => (
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
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No emails found</TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.template_name || "—"}</TableCell>
                    <TableCell className="text-sm">{log.recipient_email || "—"}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[log.status] || "bg-muted text-muted-foreground"} variant="secondary">
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-sm text-red-500 max-w-[200px] truncate">
                      {log.error_message || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
