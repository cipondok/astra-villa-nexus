import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { 
  DollarSign, Building, Home, Wrench, TrendingUp, Clock, 
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye,
  Download, Filter, Search, ArrowUpDown, Bell
} from "lucide-react";
import { formatIDR } from "@/utils/formatters";
import { toast } from "sonner";

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_type: string;
  status: string;
  base_amount: number;
  total_tax: number;
  service_charges: number;
  total_amount: number;
  payment_status: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  due_date: string;
}

interface TransactionStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  totalTax: number;
  totalServiceCharges: number;
}

const TransactionManagementHub = () => {
  const { t, language } = useTranslation();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    total: 0, pending: 0, completed: 0, cancelled: 0,
    totalRevenue: 0, totalTax: 0, totalServiceCharges: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('unified_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as "pending" | "processing" | "completed" | "cancelled" | "refunded" | "disputed");
      }
      if (typeFilter !== 'all') {
        query = query.eq('transaction_type', typeFilter as "property_sale" | "property_rental" | "vendor_service");
      }
      if (searchTerm) {
        query = query.ilike('transaction_number', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);

      const allTx = data || [];
      setStats({
        total: allTx.length,
        pending: allTx.filter(tx => tx.status === 'pending').length,
        completed: allTx.filter(tx => tx.status === 'completed').length,
        cancelled: allTx.filter(tx => tx.status === 'cancelled').length,
        totalRevenue: allTx.reduce((sum, tx) => sum + (tx.total_amount || 0), 0),
        totalTax: allTx.reduce((sum, tx) => sum + (tx.total_tax || 0), 0),
        totalServiceCharges: allTx.reduce((sum, tx) => sum + (tx.service_charges || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('transactions-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'unified_transactions'
      }, () => {
        fetchTransactions();
        toast.info(t('transactionHub.transactionUpdated'));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, typeFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      processing: { variant: "default", icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
      completed: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      refunded: { variant: "outline", icon: <RefreshCw className="h-3 w-3" /> },
      disputed: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property_sale': return <Building className="h-4 w-4 text-chart-4" />;
      case 'property_rental': return <Home className="h-4 w-4 text-chart-1" />;
      case 'vendor_service': return <Wrench className="h-4 w-4 text-chart-3" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="border-border/30">
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold">{t('transactionHub.title')}</h2>
                <p className="text-xs text-muted-foreground">{t('transactionHub.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1.5 text-xs h-6 px-2 bg-chart-1/10 text-chart-1 border-chart-1/30">
                <span className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
                {t('transactionHub.realTimeActive')}
              </Badge>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={fetchTransactions}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                {t('transactionHub.refresh')}
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                {t('transactionHub.exportData')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-chart-4" />
              <span className="text-xs text-chart-4">{t('transactionHub.totalTransactions')}</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-chart-3" />
              <span className="text-xs text-chart-3">{t('transactionHub.pendingPayments')}</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-chart-1" />
              <span className="text-xs text-chart-1">{t('transactionHub.completed')}</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive">{t('transactionHub.cancelled')}</span>
            </div>
            <p className="text-lg font-bold text-foreground mt-1">{stats.cancelled}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-accent-foreground" />
              <span className="text-xs text-accent-foreground">{t('transactionHub.totalRevenue')}</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">{formatIDR(stats.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary">{t('transactionHub.taxCollected')}</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">{formatIDR(stats.totalTax)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-chart-3" />
              <span className="text-xs text-chart-3">{t('transactionHub.serviceCharges')}</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1">{formatIDR(stats.totalServiceCharges)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="h-9 p-1 bg-muted/50 rounded-lg inline-flex gap-1">
          <TabsTrigger value="all" onClick={() => setTypeFilter('all')} className="h-7 text-xs px-3">{t('transactionHub.allTransactions')}</TabsTrigger>
          <TabsTrigger value="property_sale" onClick={() => setTypeFilter('property_sale')} className="h-7 text-xs px-3">
            <Building className="h-3.5 w-3.5 mr-1" />
            {t('transactionHub.propertySales')}
          </TabsTrigger>
          <TabsTrigger value="property_rental" onClick={() => setTypeFilter('property_rental')} className="h-7 text-xs px-3">
            <Home className="h-3.5 w-3.5 mr-1" />
            {t('transactionHub.rentals')}
          </TabsTrigger>
          <TabsTrigger value="vendor_service" onClick={() => setTypeFilter('vendor_service')} className="h-7 text-xs px-3">
            <Wrench className="h-3.5 w-3.5 mr-1" />
            {t('transactionHub.vendorServices')}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="h-7 text-xs px-3">
            <Bell className="h-3.5 w-3.5 mr-1" />
            {t('transactionHub.alerts')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>{t('transactionHub.recentTransactions')}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder={t('transactionHub.search')}
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-1" />
                      <SelectValue placeholder={t('transactionHub.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('transactionHub.all')}</SelectItem>
                      <SelectItem value="pending">{t('transactionHub.pending')}</SelectItem>
                      <SelectItem value="processing">{t('transactionHub.processing')}</SelectItem>
                      <SelectItem value="completed">{t('transactionHub.completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('transactionHub.cancelled')}</SelectItem>
                      <SelectItem value="refunded">{t('transactionHub.refunded')}</SelectItem>
                      <SelectItem value="disputed">{t('transactionHub.disputed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('transactionHub.loading')}</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('transactionHub.noTransactions')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('transactionHub.transactionNumber')}</TableHead>
                        <TableHead>{t('transactionHub.type')}</TableHead>
                        <TableHead className="text-right">{t('transactionHub.amount')}</TableHead>
                        <TableHead>{t('transactionHub.status')}</TableHead>
                        <TableHead>{t('transactionHub.paymentStatus')}</TableHead>
                        <TableHead>{t('transactionHub.date')}</TableHead>
                        <TableHead>{t('transactionHub.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-sm">{tx.transaction_number}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(tx.transaction_type)}
                              <span className="capitalize">{tx.transaction_type.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatIDR(tx.total_amount)}</TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                          <TableCell>
                            <Badge variant={tx.payment_status === 'paid' ? 'default' : 'secondary'}>
                              {tx.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(tx.created_at).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property_sale">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-chart-4" />
                {t('transactionHub.propertySales')}
              </CardTitle>
              <CardDescription>{t('transactionHub.propertySalesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('transactionHub.showingPropertySales')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property_rental">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-chart-1" />
                {t('transactionHub.rentals')}
              </CardTitle>
              <CardDescription>{t('transactionHub.rentalsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('transactionHub.showingRentals')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendor_service">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-chart-3" />
                {t('transactionHub.vendorServices')}
              </CardTitle>
              <CardDescription>{t('transactionHub.vendorServicesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('transactionHub.showingVendorServices')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-chart-3" />
                {t('transactionHub.alerts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('transactionHub.alertsPlaceholder')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionManagementHub;
