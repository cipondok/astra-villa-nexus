import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, History, Heart, RotateCcw, Settings, Home, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Star } from "lucide-react";
import BackToHomeLink from "@/components/common/BackToHomeLink";

// Tab components
const CurrentBookingsTab = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">Booking Aktif</h2>
      <Badge variant="secondary" className="text-xs">0 aktif</Badge>
    </div>
    {/* Empty state */}
    <Card className="p-8 border-border">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Booking</h3>
        <p className="text-sm text-muted-foreground mb-4">Anda belum memiliki booking aktif. Mulai cari properti sewa sekarang!</p>
        <Button onClick={() => window.location.href = '/disewa'} variant="default" size="sm">
          Cari Properti
        </Button>
      </div>
    </Card>

    {/* Example booking card (will be populated from DB) */}
    <Card className="border-border overflow-hidden opacity-60">
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200" alt="Preview" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground line-clamp-1">Villa Contoh di Bali</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> Seminyak, Bali</p>
            </div>
            <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px]">
              <CheckCircle className="h-3 w-3 mr-0.5" /> Confirmed
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Check-in: 15 Mar</span>
            <span>3 malam</span>
          </div>
          <p className="text-sm font-semibold text-primary mt-1">Rp 4.500.000</p>
        </div>
      </div>
    </Card>
  </div>
);

const BookingHistoryTab = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-foreground">Riwayat Booking</h2>
    <Card className="p-8 border-border">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <History className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Riwayat</h3>
        <p className="text-sm text-muted-foreground">Riwayat booking Anda akan muncul di sini setelah selesai.</p>
      </div>
    </Card>
  </div>
);

const FavouritesTab = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-foreground">Properti Favorit</h2>
    <Card className="p-8 border-border">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
          <Heart className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Favorit</h3>
        <p className="text-sm text-muted-foreground mb-4">Simpan properti yang Anda sukai untuk melihatnya nanti.</p>
        <Button onClick={() => window.location.href = '/disewa'} variant="outline" size="sm">
          Jelajahi Properti
        </Button>
      </div>
    </Card>
  </div>
);

const CancelRefundTab = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-foreground">Pembatalan & Refund</h2>
    <Card className="p-8 border-border">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
          <RotateCcw className="h-7 w-7 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Tidak Ada Permintaan Refund</h3>
        <p className="text-sm text-muted-foreground">Permintaan pembatalan dan refund akan muncul di sini.</p>
      </div>
    </Card>

    {/* Refund process info */}
    <Card className="border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Proses Refund ASTRA Villa</h3>
      <div className="space-y-3">
        {[
          { icon: AlertCircle, label: "Ajukan Pembatalan", desc: "Pilih booking dan kirim alasan pembatalan", color: "text-chart-1" },
          { icon: Clock, label: "Review (1-3 hari)", desc: "Tim kami akan memproses permintaan Anda", color: "text-primary" },
          { icon: CheckCircle, label: "Refund Diproses", desc: "Dana dikembalikan ke metode pembayaran asal", color: "text-chart-1" },
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${step.color}`}>
              <step.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const SettingsTab = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-foreground">Pengaturan Sewa</h2>
    <div className="grid gap-4">
      <Card className="border-border p-4">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm">Notifikasi</CardTitle>
          <CardDescription className="text-xs">Atur preferensi notifikasi untuk booking</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {["Email konfirmasi booking", "Pengingat check-in", "Promo & penawaran khusus"].map((item, i) => (
            <label key={i} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-foreground">{item}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary" />
            </label>
          ))}
        </div>
      </Card>
      <Card className="border-border p-4">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm">Preferensi Pencarian</CardTitle>
          <CardDescription className="text-xs">Default filter untuk pencarian properti</CardDescription>
        </CardHeader>
        <p className="text-xs text-muted-foreground">Fitur ini akan segera tersedia.</p>
      </Card>
    </div>
  </div>
);

const UserRentalDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Dashboard Sewa — ASTRA Villa" description="Kelola booking, riwayat sewa, favorit, dan pengaturan akun rental Anda di ASTRA Villa." />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center gap-3 mb-6">
          <BackToHomeLink sectionId="rent-section" className="mb-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Dashboard Sewa</h1>
            <p className="text-xs text-muted-foreground">Kelola semua aktivitas rental Anda</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full flex overflow-x-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="bookings" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <CalendarDays className="h-3.5 w-3.5" /> Booking Aktif
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <History className="h-3.5 w-3.5" /> Riwayat
            </TabsTrigger>
            <TabsTrigger value="favourites" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Heart className="h-3.5 w-3.5" /> Favorit
            </TabsTrigger>
            <TabsTrigger value="refund" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <RotateCcw className="h-3.5 w-3.5" /> Refund
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5" /> Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings"><CurrentBookingsTab /></TabsContent>
          <TabsContent value="history"><BookingHistoryTab /></TabsContent>
          <TabsContent value="favourites"><FavouritesTab /></TabsContent>
          <TabsContent value="refund"><CancelRefundTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserRentalDashboard;
