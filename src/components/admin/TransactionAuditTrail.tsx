import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { 
  History, Search, Filter, Download, RefreshCw,
  ArrowRight, User, Calendar, Clock
} from "lucide-react";
// formatIDR removed — not used in this component

interface AuditLog {
  id: string;
  transaction_id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  changed_by: string | null;
  change_reason: string | null;
  ip_address: unknown;
  created_at: string;
  metadata: unknown;
}

const TransactionAuditTrail = () => {
  const { t } = useTranslation();
  
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
    const colors: Record<string, string> = {
      created: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
      status_change: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
      payment_status_change: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
      updated: 'bg-chart-3/10 text-chart-3 border-chart-3/30'
    };
    const color = colors[action] || colors.updated;
    return <Badge className={color}>{action.replace('_', ' ')}</Badge>;
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
            {t('auditTrail.title')}
          </h2>
          <p className="text-muted-foreground">{t('auditTrail.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {t('auditTrail.totalLogs')}: {filteredLogs.length}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('auditTrail.refresh')}
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-1" />
            {t('auditTrail.export')}
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
                placeholder={t('auditTrail.search')}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue placeholder={t('auditTrail.filterByAction')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('auditTrail.allActions')}</SelectItem>
                <SelectItem value="created">{t('auditTrail.created')}</SelectItem>
                <SelectItem value="status_change">{t('auditTrail.statusChange')}</SelectItem>
                <SelectItem value="payment_status_change">{t('auditTrail.paymentStatusChange')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('auditTrail.auditLogs')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('auditTrail.loading')}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('auditTrail.noLogs')}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('auditTrail.transactionId')}</TableHead>
                    <TableHead>{t('auditTrail.action')}</TableHead>
                    <TableHead>{t('auditTrail.change')}</TableHead>
                    <TableHead>{t('auditTrail.changedBy')}</TableHead>
                    <TableHead>{t('auditTrail.timestamp')}</TableHead>
                    <TableHead>{t('auditTrail.ipAddress')}</TableHead>
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
                          {String(log.ip_address) || '-'}
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
