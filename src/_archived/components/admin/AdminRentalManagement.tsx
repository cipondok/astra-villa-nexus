import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, CalendarDays, DollarSign, CheckCircle, Clock, Users,
  BarChart3, MapPin, TrendingUp, XCircle, RotateCcw, AlertCircle, Search
} from "lucide-react";
import { getCurrencyFormatter, getCurrencyFormatterShort } from "@/stores/currencyStore";

const AdminRentalManagement = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Rental Management</h2>
          <p className="text-xs text-muted-foreground">Overview semua aktivitas rental di platform ASTRA Villa</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CalendarDays, label: "Total Bookings", value: "0", color: "text-primary", bg: "bg-primary/10" },
          { icon: CheckCircle, label: "Active Rentals", value: "0", color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: RotateCcw, label: "Refund Requests", value: "0", color: "text-destructive", bg: "bg-destructive/10" },
          { icon: DollarSign, label: "Rental Revenue", value: getCurrencyFormatter()(0), color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-2.5">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-base font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bookings" className="space-y-3">
        <TabsList className="h-9 p-0.5 w-full grid grid-cols-3">
          <TabsTrigger value="bookings" className="text-xs gap-1"><CalendarDays className="h-3.5 w-3.5" /> Bookings</TabsTrigger>
          <TabsTrigger value="refunds" className="text-xs gap-1"><RotateCcw className="h-3.5 w-3.5" /> Refunds</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card className="p-6 border-border">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">All Platform Bookings</h3>
              <p className="text-sm text-muted-foreground">
                Semua booking rental di seluruh platform akan ditampilkan di sini.
              </p>
            </div>
          </Card>

          {/* Example booking row */}
          <div className="mt-3 space-y-2">
            {[
              { id: "BK-001", guest: "John D.", property: "Villa Bali Paradise", status: "confirmed", amount: getCurrencyFormatterShort()(4_500_000), statusColor: "text-chart-1 bg-chart-1/10" },
              { id: "BK-002", guest: "Sarah M.", property: "Apartment Jakarta", status: "pending", amount: getCurrencyFormatterShort()(8_000_000), statusColor: "text-chart-3 bg-chart-3/10" },
            ].map((booking, i) => (
              <Card key={i} className="p-3 border-border opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{booking.id} — {booking.guest}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{booking.property}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{booking.amount}</span>
                    <Badge className={`text-[9px] ${booking.statusColor} border-0`}>{booking.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <Card className="p-6 border-border">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                <RotateCcw className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Refund Requests</h3>
              <p className="text-sm text-muted-foreground">
                Kelola permintaan refund dari pengguna. Approve atau reject permintaan.
              </p>
            </div>
          </Card>

          {/* Example refund */}
          <Card className="mt-3 p-3 border-border opacity-60">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs font-medium">Refund #RF-001</p>
                  <p className="text-[10px] text-muted-foreground">Booking BK-003 — Alasan: Perubahan rencana</p>
                  <p className="text-xs font-semibold text-foreground mt-1">{getCurrencyFormatter()(2_500_000)}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" className="h-7 text-[10px] px-2.5">Approve</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] px-2.5">Reject</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-4 border-border">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-chart-1" /> Occupancy Rate
                </CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { label: "Bali", rate: "78%", bar: 78 },
                  { label: "Jakarta", rate: "65%", bar: 65 },
                  { label: "Bandung", rate: "52%", bar: 52 },
                  { label: "Surabaya", rate: "41%", bar: 41 },
                ].map((loc, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-muted-foreground">{loc.label}</span>
                      <span className="font-medium">{loc.rate}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${loc.bar}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-border">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-primary" /> Revenue by Period
                </CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { label: "Harian", value: getCurrencyFormatter()(0), pct: "0%" },
                  { label: "Bulanan", value: getCurrencyFormatter()(0), pct: "0%" },
                  { label: "Tahunan", value: getCurrencyFormatter()(0), pct: "0%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <div className="text-right">
                      <span className="text-xs font-bold">{item.value}</span>
                      <span className="text-[9px] text-muted-foreground ml-1">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-border sm:col-span-2">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-accent" /> Popular Locations
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Seminyak, Bali", "Ubud, Bali", "Menteng, Jakarta", "Dago, Bandung"].map((loc, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs font-medium text-foreground">{loc}</p>
                    <p className="text-[9px] text-muted-foreground">0 bookings</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRentalManagement;
