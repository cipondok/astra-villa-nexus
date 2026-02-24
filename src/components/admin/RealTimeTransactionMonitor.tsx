import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { 
  Activity, TrendingUp, TrendingDown, DollarSign, 
  Clock, CheckCircle, AlertTriangle, Users, Zap
} from "lucide-react";
import { formatIDR } from "@/utils/formatters";

interface LiveStats {
  activeTransactions: number;
  todayRevenue: number;
  todayTransactions: number;
  pendingPayments: number;
  completedToday: number;
  averageProcessingTime: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

const text = {
  en: {
    title: "Real-Time Transaction Monitor",
    liveStats: "Live Statistics",
    activeTransactions: "Active Transactions",
    todayRevenue: "Today's Revenue",
    todayTransactions: "Today's Transactions",
    pendingPayments: "Pending Payments",
    completedToday: "Completed Today",
    avgProcessingTime: "Avg Processing Time",
    conversionRate: "Conversion Rate",
    recentActivity: "Recent Activity",
    noActivity: "No recent activity",
    liveIndicator: "LIVE",
    minutes: "minutes",
    transactionReceived: "New transaction received",
    paymentCompleted: "Payment completed",
    transactionCancelled: "Transaction cancelled",
    refundProcessed: "Refund processed"
  },
  id: {
    title: "Monitor Transaksi Real-Time",
    liveStats: "Statistik Langsung",
    activeTransactions: "Transaksi Aktif",
    todayRevenue: "Pendapatan Hari Ini",
    todayTransactions: "Transaksi Hari Ini",
    pendingPayments: "Pembayaran Tertunda",
    completedToday: "Selesai Hari Ini",
    avgProcessingTime: "Rata-rata Waktu Proses",
    conversionRate: "Tingkat Konversi",
    recentActivity: "Aktivitas Terbaru",
    noActivity: "Tidak ada aktivitas terbaru",
    liveIndicator: "LANGSUNG",
    minutes: "menit",
    transactionReceived: "Transaksi baru diterima",
    paymentCompleted: "Pembayaran selesai",
    transactionCancelled: "Transaksi dibatalkan",
    refundProcessed: "Pengembalian diproses"
  }
};

const RealTimeTransactionMonitor = () => {
  const { language } = useTranslation();
  const t = text[language] || text.en;
  
  const [stats, setStats] = useState<LiveStats>({
    activeTransactions: 0,
    todayRevenue: 0,
    todayTransactions: 0,
    pendingPayments: 0,
    completedToday: 0,
    averageProcessingTime: 0,
    conversionRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('unified_transactions')
        .select('*')
        .gte('created_at', today.toISOString());

      if (error) throw error;

      const transactions = data || [];
      
      setStats({
        activeTransactions: transactions.filter(tx => tx.status === 'processing').length,
        todayRevenue: transactions
          .filter(tx => tx.status === 'completed')
          .reduce((sum, tx) => sum + (tx.total_amount || 0), 0),
        todayTransactions: transactions.length,
        pendingPayments: transactions.filter(tx => tx.payment_status === 'pending').length,
        completedToday: transactions.filter(tx => tx.status === 'completed').length,
        averageProcessingTime: 15, // Mock value - would calculate from real data
        conversionRate: transactions.length > 0 
          ? Math.round((transactions.filter(tx => tx.status === 'completed').length / transactions.length) * 100)
          : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Real-time subscription
    const channel = supabase
      .channel('monitor-transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'unified_transactions'
      }, (payload) => {
        fetchStats();
        
        // Add to recent activity
        const newActivity: RecentActivity = {
          id: crypto.randomUUID(),
          type: payload.eventType,
          message: payload.eventType === 'INSERT' 
            ? t.transactionReceived
            : payload.eventType === 'UPDATE'
            ? (payload.new as any).status === 'completed' 
              ? t.paymentCompleted 
              : (payload.new as any).status === 'cancelled'
              ? t.transactionCancelled
              : t.refundProcessed
            : 'Transaction updated',
          timestamp: new Date(),
          status: payload.eventType === 'INSERT' ? 'info' 
            : (payload.new as any).status === 'completed' ? 'success'
            : (payload.new as any).status === 'cancelled' ? 'error'
            : 'warning'
        };

        setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getActivityIcon = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-chart-1" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-chart-3" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Zap className="h-4 w-4 text-chart-2" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Live Indicator */}
      <Card className="border-border/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold">{t.title}</h2>
                <p className="text-xs text-muted-foreground">{t.liveStats}</p>
              </div>
            </div>
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className={`flex items-center gap-1.5 text-xs h-6 px-2 ${isConnected ? 'bg-chart-1' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-background animate-pulse' : 'bg-background'}`} />
              {t.liveIndicator}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-chart-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs">{t.activeTransactions}</span>
            </div>
            <p className="text-lg font-bold mt-1">{stats.activeTransactions}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-chart-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">{t.todayRevenue}</span>
            </div>
            <p className="text-sm font-bold mt-1">{formatIDR(stats.todayRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-primary">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">{t.todayTransactions}</span>
            </div>
            <p className="text-lg font-bold mt-1">{stats.todayTransactions}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-chart-3">
              <Clock className="h-4 w-4" />
              <span className="text-xs">{t.pendingPayments}</span>
            </div>
            <p className="text-lg font-bold mt-1">{stats.pendingPayments}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-chart-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">{t.completedToday}</span>
            </div>
            <p className="text-lg font-bold mt-1">{stats.completedToday}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-chart-4">
              <Clock className="h-4 w-4" />
              <span className="text-xs">{t.avgProcessingTime}</span>
            </div>
            <p className="text-lg font-bold mt-1">{stats.averageProcessingTime} {t.minutes}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-secondary-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">{t.conversionRate}</span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-bold">{stats.conversionRate}%</p>
              <Progress value={stats.conversionRate} className="h-1.5 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/30">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Activity className="h-3.5 w-3.5" />
            {t.recentActivity}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-xs">{t.noActivity}</p>
          ) : (
            <div className="space-y-1.5">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/20 animate-fade-in"
                >
                  {getActivityIcon(activity.status)}
                  <span className="flex-1 text-xs">{activity.message}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeTransactionMonitor;
