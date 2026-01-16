import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  History, Search, Filter, Download, RefreshCw,
  ArrowRight, User, Calendar, Clock
} from "lucide-react";
import { formatIDR } from "@/utils/formatters";

interface AuditLog {
  id: string;
  transaction_id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  changed_by: string | null;
  change_reason: string | null;
  ip_address: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

const text = {
  en: {
    title: "Transaction Audit Trail",
    subtitle: "Complete history of all transaction changes and actions",
    transactionId: "Transaction ID",
    action: "Action",
    change: "Change",
    changedBy: "Changed By",
    timestamp: "Timestamp",
    ipAddress: "IP Address",
    reason: "Reason",
    search: "Search by transaction ID...",
    filterByAction: "Filter by action",
    allActions: "All Actions",
    statusChange: "Status Change",
    paymentStatusChange: "Payment Status",
    created: "Created",
    updated: "Updated",
    noLogs: "No audit logs found",
    loading: "Loading...",
    refresh: "Refresh",
    export: "Export",
    totalLogs: "Total Logs"
  },
  id: {
    title: "Jejak Audit Transaksi",
    subtitle: "Riwayat lengkap semua perubahan dan aksi transaksi",
    transactionId: "ID Transaksi",
    action: "Aksi",
    change: "Perubahan",
    changedBy: "Diubah Oleh",
    timestamp: "Waktu",
    ipAddress: "Alamat IP",
    reason: "Alasan",
    search: "Cari berdasarkan ID transaksi...",
    filterByAction: "Filter berdasarkan aksi",
    allActions: "Semua Aksi",
    statusChange: "Perubahan Status",
    paymentStatusChange: "Status Pembayaran",
    created: "Dibuat",
    updated: "Diperbarui",
    noLogs: "Tidak ada log audit ditemukan",
    loading: "Memuat...",
    refresh: "Segarkan",
    export: "Ekspor",
    totalLogs: "Total Log"
  }
};

const TransactionAuditTrail = () => {
  const { language } = useLanguage();
  const t = text[language];
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('transaction_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter(log => 
    searchTerm === '' || 
    log.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; color: string }> = {
      created: { variant: "default", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
      status_change: { variant: "secondary", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
      payment_status_change: { variant: "outline", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      updated: { variant: "secondary", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" }
    };
    const config = variants[action] || variants.updated;
    return <Badge className={config.color}>{action.replace('_', ' ')}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID')
    };
  };

  const exportLogs = () => {
    const csv = [
      ['Transaction ID', 'Action', 'Previous Status', 'New Status', 'Changed By', 'Timestamp', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.transaction_id,
        log.action,
        log.previous_status || '',
        log.new_status || '',
        log.changed_by || '',
        log.created_at,
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {t.totalLogs}: {filteredLogs.length}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t.refresh}
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-1" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t.search}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue placeholder={t.filterByAction} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allActions}</SelectItem>
                <SelectItem value="created">{t.created}</SelectItem>
                <SelectItem value="status_change">{t.statusChange}</SelectItem>
                <SelectItem value="payment_status_change">{t.paymentStatusChange}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'id' ? 'Log Audit' : 'Audit Logs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t.noLogs}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.transactionId}</TableHead>
                    <TableHead>{t.action}</TableHead>
                    <TableHead>{t.change}</TableHead>
                    <TableHead>{t.changedBy}</TableHead>
                    <TableHead>{t.timestamp}</TableHead>
                    <TableHead>{t.ipAddress}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const ts = formatTimestamp(log.created_at);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {log.transaction_id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          {log.previous_status || log.new_status ? (
                            <div className="flex items-center gap-2 text-sm">
                              {log.previous_status && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  {log.previous_status}
                                </Badge>
                              )}
                              {log.previous_status && log.new_status && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              )}
                              {log.new_status && (
                                <Badge variant="default">
                                  {log.new_status}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.changed_by ? (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3" />
                              <span className="font-mono text-xs">{log.changed_by.substring(0, 8)}...</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {ts.date}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {ts.time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.ip_address || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionAuditTrail;
