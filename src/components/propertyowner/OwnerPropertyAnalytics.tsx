import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Price from "@/components/ui/Price";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import {
  Loader2, Building, Eye, Heart, MessageSquare, CalendarDays,
  DollarSign, TrendingUp, Users, BarChart3, Target, Home
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-3))", "hsl(var(--destructive))", "hsl(var(--chart-5))"];

interface PropertyStat {
  id: string;
  title: string;
  city: string;
  status: string;
  price: number;
  listing_type: string;
  thumbnail_url: string | null;
  images: string[] | null;
  inquiries: number;
  favorites: number;
  visits: number;
  bookings: number;
  revenue: number;
  paidRevenue: number;
  occupancyDays: number;
  totalDays: number;
}

const OwnerPropertyAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [propertyStats, setPropertyStats] = useState<PropertyStat[]>([]);
  const [selectedId, setSelectedId] = useState<string>("all");

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: props } = await supabase
        .from("properties")
        .select("id, title, city, status, price, listing_type, thumbnail_url, images")
        .eq("owner_id", user.id);

      if (!props?.length) { setPropertyStats([]); setLoading(false); return; }
      const propIds = props.map(p => p.id);

      const [inquiriesRes, favoritesRes, visitsRes, bookingsRes] = await Promise.all([
        supabase.from("inquiries").select("property_id").in("property_id", propIds),
        supabase.from("favorites").select("property_id").in("property_id", propIds),
        supabase.from("property_visits").select("property_id").in("property_id", propIds),
        supabase.from("rental_bookings").select("property_id, total_amount, payment_status, check_in_date, check_out_date, booking_status").in("property_id", propIds),
      ]);

      const stats: PropertyStat[] = props.map(p => {
        const pInquiries = (inquiriesRes.data || []).filter(i => i.property_id === p.id).length;
        const pFavorites = (favoritesRes.data || []).filter(f => f.property_id === p.id).length;
        const pVisits = (visitsRes.data || []).filter(v => v.property_id === p.id).length;
        const pBookings = (bookingsRes.data || []).filter(b => b.property_id === p.id);
        const revenue = pBookings.reduce((s, b) => s + (b.total_amount || 0), 0);
        const paidRevenue = pBookings.filter(b => b.payment_status === "paid").reduce((s, b) => s + (b.total_amount || 0), 0);

        // Calculate occupancy days
        let occupancyDays = 0;
        const activeBookings = pBookings.filter(b => ["confirmed", "completed"].includes(b.booking_status || ""));
        activeBookings.forEach(b => {
          if (b.check_in_date && b.check_out_date) {
            const days = Math.max(0, Math.ceil((new Date(b.check_out_date).getTime() - new Date(b.check_in_date).getTime()) / 86400000));
            occupancyDays += days;
          }
        });

        return {
          id: p.id,
          title: p.title || "Untitled",
          city: p.city || "-",
          status: p.status || "draft",
          price: p.price || 0,
          listing_type: p.listing_type || "sale",
          thumbnail_url: p.thumbnail_url,
          images: p.images as string[] | null,
          inquiries: pInquiries,
          favorites: pFavorites,
          visits: pVisits,
          bookings: pBookings.length,
          revenue,
          paidRevenue,
          occupancyDays,
          totalDays: 365,
        };
      });

      // Sort by revenue descending
      stats.sort((a, b) => b.revenue - a.revenue);
      setPropertyStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selected = useMemo(() => {
    if (selectedId === "all") return null;
    return propertyStats.find(p => p.id === selectedId) || null;
  }, [selectedId, propertyStats]);

  const aggregated = useMemo(() => {
    const list = selected ? [selected] : propertyStats;
    return {
      inquiries: list.reduce((s, p) => s + p.inquiries, 0),
      favorites: list.reduce((s, p) => s + p.favorites, 0),
      visits: list.reduce((s, p) => s + p.visits, 0),
      bookings: list.reduce((s, p) => s + p.bookings, 0),
      revenue: list.reduce((s, p) => s + p.revenue, 0),
      paidRevenue: list.reduce((s, p) => s + p.paidRevenue, 0),
      occupancyRate: list.length > 0
        ? Math.round(list.reduce((s, p) => s + (p.totalDays > 0 ? (p.occupancyDays / p.totalDays) * 100 : 0), 0) / list.length)
        : 0,
    };
  }, [selected, propertyStats]);

  // Chart data: top properties by revenue
  const revenueChartData = useMemo(() =>
    propertyStats.slice(0, 8).map(p => ({
      name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
      revenue: p.revenue,
    })), [propertyStats]);

  // Engagement chart data
  const engagementChartData = useMemo(() =>
    propertyStats.slice(0, 8).map(p => ({
      name: p.title.length > 12 ? p.title.slice(0, 12) + "…" : p.title,
      inquiries: p.inquiries,
      favorites: p.favorites,
      visits: p.visits,
    })), [propertyStats]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    propertyStats.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [propertyStats]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (propertyStats.length === 0) {
    return (
      <Card className="p-8 border-border text-center">
        <Building className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm font-medium">Belum ada properti</p>
        <p className="text-xs text-muted-foreground">Tambahkan properti untuk melihat analitik</p>
      </Card>
    );
  }

  const conversionRate = aggregated.inquiries > 0 
    ? ((aggregated.bookings / aggregated.inquiries) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-3">
      {/* Property Selector */}
      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder="Pilih properti" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Properti ({propertyStats.length})</SelectItem>
          {propertyStats.map(p => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {p.title} — {p.city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { icon: MessageSquare, label: "Inquiries", value: aggregated.inquiries, color: "text-primary", bg: "bg-primary/10" },
          { icon: Heart, label: "Favorit", value: aggregated.favorites, color: "text-destructive", bg: "bg-destructive/10" },
          { icon: Eye, label: "Kunjungan", value: aggregated.visits, color: "text-chart-5", bg: "bg-chart-5/10" },
          { icon: CalendarDays, label: "Booking", value: aggregated.bookings, color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: Target, label: "Konversi", value: `${conversionRate}%`, color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: Home, label: "Occupancy", value: `${aggregated.occupancyRate}%`, color: "text-primary", bg: "bg-primary/10" },
        ].map((s, i) => (
          <Card key={i} className="p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-3 w-3 ${s.color}`} />
              </div>
            </div>
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Revenue Summary */}
      <Card className="p-3 border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-chart-1" />
            <span className="text-xs font-semibold">Pendapatan</span>
          </div>
          <span className="text-sm font-bold text-chart-1"><Price amount={aggregated.revenue} short /></span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-chart-1/10 rounded-lg p-2">
            <p className="text-[9px] text-muted-foreground">Lunas</p>
            <p className="text-xs font-bold text-chart-1"><Price amount={aggregated.paidRevenue} short /></p>
          </div>
          <div className="bg-destructive/10 rounded-lg p-2">
            <p className="text-[9px] text-muted-foreground">Belum Bayar</p>
            <p className="text-xs font-bold text-destructive"><Price amount={aggregated.revenue - aggregated.paidRevenue} short /></p>
          </div>
        </div>
      </Card>

      {/* Charts — only show for "all" view */}
      {selectedId === "all" && (
        <>
          {/* Revenue by Property */}
          {revenueChartData.length > 0 && (
            <Card className="p-2.5 border-border">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" /> Pendapatan per Properti
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={90} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [getCurrencyFormatter()(value), "Pendapatan"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Status Distribution */}
          {statusDistribution.length > 0 && (
            <Card className="p-2.5 border-border">
              <CardHeader className="p-0 pb-1">
                <CardTitle className="text-[10px]">Distribusi Status</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} innerRadius={25}>
                      {statusDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {statusDistribution.map((s, i) => (
                    <div key={i} className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {s.name} ({s.value})
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Property Ranking Table */}
      <Card className="border-border">
        <CardHeader className="p-2.5 pb-1">
          <CardTitle className="text-[10px] flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-chart-1" /> Ranking Properti
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="space-y-1.5">
            {propertyStats.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 p-2 rounded-lg border border-border/50 ${selectedId === p.id ? 'bg-primary/5 border-primary/30' : 'bg-muted/20'} cursor-pointer hover:bg-muted/40 transition-colors`}
                onClick={() => setSelectedId(selectedId === p.id ? "all" : p.id)}
              >
                <span className="text-[10px] font-bold text-muted-foreground w-4 text-center">#{i + 1}</span>
                <div className="h-8 w-8 rounded bg-muted overflow-hidden flex-shrink-0">
                  {(p.thumbnail_url || p.images?.[0]) ? (
                    <img src={p.thumbnail_url || p.images![0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Building className="h-3 w-3 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-[8px] text-muted-foreground">{p.city}</p>
                </div>
                <div className="flex gap-3 flex-shrink-0 text-[9px]">
                  <div className="text-center">
                    <p className="font-bold text-foreground">{p.inquiries}</p>
                    <p className="text-[7px] text-muted-foreground">Inquiry</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{p.bookings}</p>
                    <p className="text-[7px] text-muted-foreground">Booking</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-chart-1"><Price amount={p.revenue} short /></p>
                    <p className="text-[7px] text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerPropertyAnalytics;
