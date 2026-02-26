import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, History, Heart, RotateCcw, Settings, MapPin, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, FileText, Loader2, CreditCard, Wrench, Plus, Shield, Receipt, ClipboardCheck, Star, Wallet } from "lucide-react";
import BackToHomeLink from "@/components/common/BackToHomeLink";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatIDR } from "@/utils/currency";
import RentalChatDialog from "@/components/rental/RentalChatDialog";
import RentalDocumentsDialog from "@/components/rental/RentalDocumentsDialog";
import MaintenanceRequestForm from "@/components/rental/MaintenanceRequestForm";
import MaintenanceRequestList from "@/components/rental/MaintenanceRequestList";
import TenantRenewalRequests from "@/components/rental/TenantRenewalRequests";
import TenantVerification from "@/components/rental/TenantVerification";
import TenantInvoices from "@/components/rental/TenantInvoices";
import TenantInspections from "@/components/rental/TenantInspections";
import { useTenantMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import TenantScoreWidget from "@/components/rental/TenantScoreWidget";
import TenantDeposits from "@/components/rental/TenantDeposits";

interface BookingRow {
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  base_price: number;
  total_amount: number;
  total_days: number;
  booking_status: string;
  payment_status: string;
  deposit_amount: number | null;
  deposit_status: string | null;
  booking_type: string | null;
  special_requests: string | null;
  created_at: string;
  properties: {
    title: string;
    location: string;
    images: string[] | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  confirmed: { label: "Dikonfirmasi", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  pending: { label: "Menunggu", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  completed: { label: "Selesai", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle },
  cancelled: { label: "Dibatalkan", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Lunas", color: "text-chart-1" },
  partial: { label: "Sebagian", color: "text-chart-3" },
  unpaid: { label: "Belum Bayar", color: "text-destructive" },
  refunded: { label: "Refunded", color: "text-muted-foreground" },
};

const BookingCard = ({ booking, onChat, onDocs, onMaintenance }: { booking: BookingRow; onChat: () => void; onDocs: () => void; onMaintenance?: () => void }) => {
  const status = statusConfig[booking.booking_status] || statusConfig.pending;
  const payment = paymentConfig[booking.payment_status || "unpaid"] || paymentConfig.unpaid;
  const StatusIcon = status.icon;
  const property = booking.properties;
  const image = property?.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200";

  return (
    <Card className="border-border overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
          <img src={image} alt={property?.title || "Property"} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground line-clamp-1">{property?.title || "Properti"}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {property?.location || "-"}
              </p>
            </div>
            <Badge className={`${status.color} text-[10px] border`}>
              <StatusIcon className="h-3 w-3 mr-0.5" /> {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.check_in_date}</span>
            <span>{booking.total_days} hari</span>
            <span className={`font-medium ${payment.color}`}>
              <CreditCard className="h-3 w-3 inline mr-0.5" />{payment.label}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-semibold text-primary">{formatIDR(booking.total_amount)}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onChat}>
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onDocs}>
                <FileText className="h-3.5 w-3.5 mr-1" /> Dokumen
              </Button>
              {onMaintenance && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onMaintenance}>
                  <Wrench className="h-3.5 w-3.5 mr-1" /> Perbaikan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const UserRentalDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const { user } = useAuth();
  const [chatBooking, setChatBooking] = useState<{ id: string; title: string } | null>(null);
  const [docsBooking, setDocsBooking] = useState<{ id: string; title: string } | null>(null);
  const [maintenanceBooking, setMaintenanceBooking] = useState<{ bookingId: string; propertyId: string } | null>(null);
  const { data: maintenanceRequests = [], isLoading: maintenanceLoading, refetch: refetchMaintenance } = useTenantMaintenanceRequests();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["tenant-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("rental_bookings")
        .select("id, property_id, check_in_date, check_out_date, base_price, total_amount, total_days, booking_status, payment_status, deposit_amount, deposit_status, booking_type, special_requests, created_at, properties(title, location, images)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BookingRow[];
    },
    enabled: !!user,
  });

  const activeBookings = bookings.filter(b => ["confirmed", "pending"].includes(b.booking_status || ""));
  const historyBookings = bookings.filter(b => ["completed", "cancelled"].includes(b.booking_status || ""));

  const openChat = (b: BookingRow) => setChatBooking({ id: b.id, title: b.properties?.title || "Properti" });
  const openDocs = (b: BookingRow) => setDocsBooking({ id: b.id, title: b.properties?.title || "Properti" });

  const EmptyState = ({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: React.ReactNode }) => (
    <Card className="p-8 border-border">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{desc}</p>
        {action}
      </div>
    </Card>
  );

  const BookingList = ({ items, emptyIcon, emptyTitle, emptyDesc }: { items: BookingRow[]; emptyIcon: React.ElementType; emptyTitle: string; emptyDesc: string }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          desc={emptyDesc}
          action={<Button onClick={() => window.location.href = '/disewa'} variant="default" size="sm">Cari Properti</Button>}
        />
      );
    }
    return (
      <div className="space-y-3">
        {items.map(b => (
          <BookingCard key={b.id} booking={b} onChat={() => openChat(b)} onDocs={() => openDocs(b)} onMaintenance={["confirmed", "pending"].includes(b.booking_status) ? () => setMaintenanceBooking({ bookingId: b.id, propertyId: b.property_id }) : undefined} />
        ))}
      </div>
    );
  };

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

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Aktif", value: activeBookings.length, color: "text-chart-1" },
            { label: "Riwayat", value: historyBookings.length, color: "text-muted-foreground" },
            { label: "Belum Bayar", value: bookings.filter(b => b.payment_status === "unpaid").length, color: "text-destructive" },
            { label: "Total", value: bookings.length, color: "text-primary" },
          ].map((s, i) => (
            <Card key={i} className="p-3 border-border">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full flex overflow-x-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="bookings" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <CalendarDays className="h-3.5 w-3.5" /> Booking Aktif
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <History className="h-3.5 w-3.5" /> Riwayat
            </TabsTrigger>
            <TabsTrigger value="refund" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <RotateCcw className="h-3.5 w-3.5" /> Refund
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Wrench className="h-3.5 w-3.5" /> Perbaikan
            </TabsTrigger>
            <TabsTrigger value="renewal" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <RotateCcw className="h-3.5 w-3.5" /> Perpanjangan
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5" /> Verifikasi
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Receipt className="h-3.5 w-3.5" /> Tagihan
            </TabsTrigger>
            <TabsTrigger value="inspection" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <ClipboardCheck className="h-3.5 w-3.5" /> Inspeksi
            </TabsTrigger>
            <TabsTrigger value="score" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Star className="h-3.5 w-3.5" /> Skor Saya
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Wallet className="h-3.5 w-3.5" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 min-w-fit gap-1.5 text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5" /> Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingList
              items={activeBookings}
              emptyIcon={CalendarDays}
              emptyTitle="Belum Ada Booking"
              emptyDesc="Anda belum memiliki booking aktif. Mulai cari properti sewa sekarang!"
            />
          </TabsContent>

          <TabsContent value="history">
            <BookingList
              items={historyBookings}
              emptyIcon={History}
              emptyTitle="Belum Ada Riwayat"
              emptyDesc="Riwayat booking Anda akan muncul di sini setelah selesai."
            />
          </TabsContent>

          <TabsContent value="refund">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Pembatalan & Refund</h2>
              {bookings.filter(b => b.booking_status === "cancelled").length === 0 ? (
                <EmptyState
                  icon={RotateCcw}
                  title="Tidak Ada Permintaan Refund"
                  desc="Permintaan pembatalan dan refund akan muncul di sini."
                />
              ) : (
                <div className="space-y-3">
                  {bookings.filter(b => b.booking_status === "cancelled").map(b => (
                    <BookingCard key={b.id} booking={b} onChat={() => openChat(b)} onDocs={() => openDocs(b)} />
                  ))}
                </div>
              )}
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
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Permintaan Perbaikan</h2>
                {activeBookings.length > 0 && (
                  <Button size="sm" onClick={() => setMaintenanceBooking({ bookingId: activeBookings[0].id, propertyId: activeBookings[0].property_id })}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Ajukan
                  </Button>
                )}
              </div>
              <MaintenanceRequestList requests={maintenanceRequests as any} isLoading={maintenanceLoading} />
            </div>
          </TabsContent>

          <TabsContent value="renewal">
            <TenantRenewalRequests />
          </TabsContent>

          <TabsContent value="verification">
            <TenantVerification />
          </TabsContent>

          <TabsContent value="invoices">
            <TenantInvoices />
          </TabsContent>

          <TabsContent value="inspection">
            <TenantInspections />
          </TabsContent>

          <TabsContent value="score">
            <TenantScoreWidget />
          </TabsContent>

          <TabsContent value="deposits">
            <TenantDeposits />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Pengaturan Sewa</h2>
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {chatBooking && (
        <RentalChatDialog
          open={!!chatBooking}
          onOpenChange={(open) => !open && setChatBooking(null)}
          bookingId={chatBooking.id}
          propertyTitle={chatBooking.title}
        />
      )}
      {docsBooking && (
        <RentalDocumentsDialog
          open={!!docsBooking}
          onOpenChange={(open) => !open && setDocsBooking(null)}
          bookingId={docsBooking.id}
          propertyTitle={docsBooking.title}
        />
      )}
      {maintenanceBooking && (
        <MaintenanceRequestForm
          open={!!maintenanceBooking}
          onOpenChange={(open) => !open && setMaintenanceBooking(null)}
          bookingId={maintenanceBooking.bookingId}
          propertyId={maintenanceBooking.propertyId}
          onSuccess={() => refetchMaintenance()}
        />
      )}
    </div>
  );
};

export default UserRentalDashboard;
