import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, subHours } from "date-fns";

interface EmailStats {
  total_count: number;
  sent_count: number;
  failed_count: number;
  suppressed_count: number;
  pending_count: number;
}

interface EmailLogEntry {
  id: string;
  message_id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

type TimeRange = "24h" | "7d" | "30d";

const statusBadge = (status: string) => {
  switch (status) {
    case "sent":
      return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
    case "dlq":
    case "failed":
      return <Badge className="bg-destructive/15 text-destructive border-destructive/20 hover:bg-destructive/20"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case "suppressed":
      return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Suppressed</Badge>;
    case "pending":
      return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getDateRange = (range: TimeRange): { start: Date; end: Date } => {
  const end = new Date();
  switch (range) {
    case "24h": return { start: subHours(end, 24), end };
    case "7d": return { start: subDays(end, 7), end };
    case "30d": return { start: subDays(end, 30), end };
  }
};

const EmailMonitorDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [entries, setEntries] = useState<EmailLogEntry[]>([]);
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase.rpc("get_email_template_names") as { data: { template_name: string }[] | null };
    if (data) setTemplates(data.map(d => d.template_name));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { start, end } = getDateRange(timeRange);
    const tpl = templateFilter === "all" ? null : templateFilter;
    const st = statusFilter === "all" ? null : statusFilter;

    const [statsRes, entriesRes] = await Promise.all([
      supabase.rpc("get_email_log_stats", {
        p_start: start.toISOString(),
        p_end: end.toISOString(),
        p_template: tpl,
        p_status: st,
      }),
      supabase.rpc("get_email_log_entries", {
        p_start: start.toISOString(),
        p_end: end.toISOString(),
        p_template: tpl,
        p_status: st,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      }),
    ]);

    if (statsRes.data && Array.isArray(statsRes.data) && statsRes.data.length > 0) {
      setStats(statsRes.data[0] as unknown as EmailStats);
    }
    if (entriesRes.data) {
      setEntries(entriesRes.data as unknown as EmailLogEntry[]);
    }
    setLoading(false);
  }, [timeRange, templateFilter, statusFilter, page]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { setPage(0); }, [timeRange, templateFilter, statusFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = [
    { label: "Total Emails", value: stats?.total_count ?? 0, icon: Mail, color: "text-primary" },
    { label: "Sent", value: stats?.sent_count ?? 0, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Failed", value: stats?.failed_count ?? 0, icon: XCircle, color: "text-destructive" },
    { label: "Suppressed", value: stats?.suppressed_count ?? 0, icon: AlertTriangle, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Monitor</h2>
          <p className="text-muted-foreground text-sm">Track email delivery, failures, and performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["24h", "7d", "30d"] as TimeRange[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={timeRange === r ? "default" : "ghost"}
              onClick={() => setTimeRange(r)}
              className="text-xs"
            >
              {r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : "30 Days"}
            </Button>
          ))}
        </div>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {templates.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="dlq">Failed</SelectItem>
            <SelectItem value="suppressed">Suppressed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Email Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {loading ? "Loading..." : "No emails found for this time range."}
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.template_name}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{e.recipient_email}</TableCell>
                      <TableCell>{statusBadge(e.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(e.created_at), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                        {e.error_message || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {entries.length} results (page {page + 1})
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={entries.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailMonitorDashboard;
