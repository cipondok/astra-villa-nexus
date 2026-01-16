import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
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

const text = {
  en: {
    title: "Transaction Management Hub",
    subtitle: "Manage all transactions - Property Sales, Rentals & Vendor Services",
    overview: "Overview",
    propertySales: "Property Sales",
    rentals: "Rentals",
    vendorServices: "Vendor Services",
    alerts: "Alerts",
    allTransactions: "All Transactions",
    totalTransactions: "Total Transactions",
    pendingPayments: "Pending Payments",
    completed: "Completed",
    cancelled: "Cancelled",
    totalRevenue: "Total Revenue",
    taxCollected: "Tax Collected",
    serviceCharges: "Service Charges",
    recentTransactions: "Recent Transactions",
    transactionNumber: "Transaction #",
    type: "Type",
    amount: "Amount",
    status: "Status",
    paymentStatus: "Payment",
    date: "Date",
    actions: "Actions",
    search: "Search transactions...",
    filterByStatus: "Filter by status",
    all: "All",
    pending: "Pending",
    processing: "Processing",
    refunded: "Refunded",
    disputed: "Disputed",
    refresh: "Refresh",
    exportData: "Export",
    viewDetails: "View",
    noTransactions: "No transactions found",
    loading: "Loading transactions...",
    realTimeActive: "Real-time Active",
    liveUpdates: "Live Updates"
  },
  id: {
    title: "Pusat Manajemen Transaksi",
    subtitle: "Kelola semua transaksi - Penjualan, Sewa & Layanan Vendor",
    overview: "Ringkasan",
    propertySales: "Penjualan Properti",
    rentals: "Penyewaan",
    vendorServices: "Layanan Vendor",
    alerts: "Peringatan",
    allTransactions: "Semua Transaksi",
    totalTransactions: "Total Transaksi",
    pendingPayments: "Pembayaran Tertunda",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    totalRevenue: "Total Pendapatan",
    taxCollected: "Pajak Terkumpul",
    serviceCharges: "Biaya Layanan",
    recentTransactions: "Transaksi Terbaru",
    transactionNumber: "No. Transaksi",
    type: "Tipe",
    amount: "Jumlah",
    status: "Status",
    paymentStatus: "Pembayaran",
    date: "Tanggal",
    actions: "Aksi",
    search: "Cari transaksi...",
    filterByStatus: "Filter berdasarkan status",
    all: "Semua",
    pending: "Tertunda",
    processing: "Diproses",
    refunded: "Dikembalikan",
    disputed: "Disengketakan",
    refresh: "Segarkan",
    exportData: "Ekspor",
    viewDetails: "Lihat",
    noTransactions: "Tidak ada transaksi ditemukan",
    loading: "Memuat transaksi...",
    realTimeActive: "Real-time Aktif",
    liveUpdates: "Pembaruan Langsung"
  }
};

const TransactionManagementHub = () => {
  const { language } = useLanguage();
  const t = text[language];
  
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

      // Calculate stats
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

    // Real-time subscription
    const channel = supabase
      .channel('transactions-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'unified_transactions'
      }, (payload) => {
        console.log('Transaction update:', payload);
        fetchTransactions();
        toast.info(language === 'id' ? 'Transaksi diperbarui' : 'Transaction updated');
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
      case 'property_sale': return <Building className="h-4 w-4 text-blue-500" />;
      case 'property_rental': return <Home className="h-4 w-4 text-green-500" />;
      case 'vendor_service': return <Wrench className="h-4 w-4 text-orange-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t.realTimeActive}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t.refresh}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            {t.exportData}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">{t.totalTransactions}</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">{t.pendingPayments}</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">{t.completed}</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-300">{t.cancelled}</span>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">{stats.cancelled}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">{t.totalRevenue}</span>
            </div>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-1">{formatIDR(stats.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-600" />
              <span className="text-sm text-indigo-700 dark:text-indigo-300">{t.taxCollected}</span>
            </div>
            <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mt-1">{formatIDR(stats.totalTax)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-orange-700 dark:text-orange-300">{t.serviceCharges}</span>
            </div>
            <p className="text-lg font-bold text-orange-900 dark:text-orange-100 mt-1">{formatIDR(stats.totalServiceCharges)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all" onClick={() => setTypeFilter('all')}>{t.allTransactions}</TabsTrigger>
          <TabsTrigger value="property_sale" onClick={() => setTypeFilter('property_sale')}>
            <Building className="h-4 w-4 mr-1" />
            {t.propertySales}
          </TabsTrigger>
          <TabsTrigger value="property_rental" onClick={() => setTypeFilter('property_rental')}>
            <Home className="h-4 w-4 mr-1" />
            {t.rentals}
          </TabsTrigger>
          <TabsTrigger value="vendor_service" onClick={() => setTypeFilter('vendor_service')}>
            <Wrench className="h-4 w-4 mr-1" />
            {t.vendorServices}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-1" />
            {t.alerts}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>{t.recentTransactions}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder={t.search}
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-1" />
                      <SelectValue placeholder={t.filterByStatus} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="pending">{t.pending}</SelectItem>
                      <SelectItem value="processing">{t.processing}</SelectItem>
                      <SelectItem value="completed">{t.completed}</SelectItem>
                      <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                      <SelectItem value="refunded">{t.refunded}</SelectItem>
                      <SelectItem value="disputed">{t.disputed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noTransactions}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.transactionNumber}</TableHead>
                        <TableHead>{t.type}</TableHead>
                        <TableHead className="text-right">{t.amount}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>{t.paymentStatus}</TableHead>
                        <TableHead>{t.date}</TableHead>
                        <TableHead>{t.actions}</TableHead>
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
                <Building className="h-5 w-5 text-blue-500" />
                {t.propertySales}
              </CardTitle>
              <CardDescription>
                {language === 'id' 
                  ? 'Transaksi penjualan properti dengan PPh 2.5% dan BPHTB 5%'
                  : 'Property sales with Income Tax 2.5% and BPHTB 5%'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Property sales specific content */}
              <p className="text-muted-foreground">
                {language === 'id' 
                  ? 'Menampilkan transaksi penjualan properti...'
                  : 'Showing property sales transactions...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property_rental">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-500" />
                {t.rentals}
              </CardTitle>
              <CardDescription>
                {language === 'id'
                  ? 'Transaksi sewa properti dengan PPh Sewa 10%'
                  : 'Property rentals with Rental Income Tax 10%'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {language === 'id'
                  ? 'Menampilkan transaksi sewa properti...'
                  : 'Showing rental transactions...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendor_service">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-500" />
                {t.vendorServices}
              </CardTitle>
              <CardDescription>
                {language === 'id'
                  ? 'Layanan vendor dengan PPN 11% dan biaya layanan 3%'
                  : 'Vendor services with VAT 11% and platform fee 3%'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {language === 'id'
                  ? 'Menampilkan transaksi layanan vendor...'
                  : 'Showing vendor service transactions...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                {t.alerts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {language === 'id'
                  ? 'Peringatan transaksi akan ditampilkan di sini...'
                  : 'Transaction alerts will be shown here...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionManagementHub;
