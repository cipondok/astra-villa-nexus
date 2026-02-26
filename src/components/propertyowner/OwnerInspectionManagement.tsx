
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardCheck, Plus, Camera, CheckCircle, AlertTriangle, Eye, Loader2, CalendarIcon, Clock } from "lucide-react";
import { format, isAfter, isBefore, isToday, addDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DEFAULT_CHECKLIST = [
  { area: "Ruang Tamu", items: ["Lantai", "Dinding", "Jendela", "Pintu", "Furnitur", "Lampu"] },
  { area: "Kamar Tidur", items: ["Lantai", "Dinding", "Kasur", "Lemari", "AC", "Lampu"] },
  { area: "Kamar Mandi", items: ["Toilet", "Wastafel", "Shower", "Cermin", "Lantai", "Keran"] },
  { area: "Dapur", items: ["Kompor", "Kulkas", "Wastafel", "Kabinet", "Lantai", "Exhaust"] },
  { area: "Umum", items: ["Kunci", "Listrik", "Air", "WiFi", "Parkir", "Kebersihan"] },
];

const conditionColors: Record<string, string> = {
  excellent: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  good: "bg-primary/10 text-primary border-primary/20",
  fair: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  poor: "bg-destructive/10 text-destructive border-destructive/20",
  damaged: "bg-destructive/10 text-destructive border-destructive/20",
  missing: "bg-muted text-muted-foreground border-border",
};

const conditionLabels: Record<string, string> = {
  excellent: "Sempurna", good: "Baik", fair: "Cukup", poor: "Buruk", damaged: "Rusak", missing: "Hilang",
};

const statusLabels: Record<string, string> = {
  scheduled: "Terjadwal", pending: "Menunggu", in_progress: "Berlangsung", completed: "Selesai", disputed: "Sengketa",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-accent/50 text-accent-foreground border-accent",
  pending: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  disputed: "bg-destructive/10 text-destructive border-destructive/20",
};

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

const OwnerInspectionManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState("upcoming");
  const [form, setForm] = useState({
    bookingId: "",
    inspectionType: "check_in" as string,
    notes: "",
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "10:00",
  });

  // Fetch bookings for creating inspections
  const { data: bookings = [] } = useQuery({
    queryKey: ["owner-bookings-for-inspection", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("rental_bookings")
        .select("id, property_id, check_in_date, check_out_date, customer_id, properties(title, owner_id)")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []).filter((b: any) => b.properties?.owner_id === user.id);
    },
    enabled: !!user,
  });

  // Fetch inspections
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["owner-inspections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("property_inspections")
        .select("*, properties(title), inspection_items(*)")
        .order("inspection_date", { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  // Create inspection with scheduled date
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !form.bookingId || !form.scheduledDate) throw new Error("Lengkapi semua field");
      const booking = bookings.find((b: any) => b.id === form.bookingId) as any;
      if (!booking) throw new Error("Booking not found");

      // Combine date and time
      const scheduledDateTime = new Date(form.scheduledDate);
      const [hours, minutes] = form.scheduledTime.split(":").map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const isNowOrPast = isBefore(scheduledDateTime, new Date());

      const { data: inspection, error } = await supabase
        .from("property_inspections")
        .insert({
          booking_id: form.bookingId,
          property_id: booking.property_id,
          inspector_id: user.id,
          tenant_id: booking.customer_id,
          inspection_type: form.inspectionType,
          notes: form.notes || null,
          inspection_date: scheduledDateTime.toISOString(),
          status: isNowOrPast ? "in_progress" : "scheduled",
        })
        .select()
        .single();

      if (error) throw error;

      // Insert default checklist items
      const items = DEFAULT_CHECKLIST.flatMap((group, gi) =>
        group.items.map((item, ii) => ({
          inspection_id: inspection.id,
          area: group.area,
          item_name: item,
          sort_order: gi * 100 + ii,
        }))
      );

      await supabase.from("inspection_items").insert(items);
      return inspection;
    },
    onSuccess: () => {
      toast.success("Inspeksi berhasil dijadwalkan!");
      queryClient.invalidateQueries({ queryKey: ["owner-inspections"] });
      setCreateOpen(false);
      setForm({ bookingId: "", inspectionType: "check_in", notes: "", scheduledDate: undefined, scheduledTime: "10:00" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Start inspection (change scheduled → in_progress)
  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("property_inspections")
        .update({ status: "in_progress" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inspeksi dimulai!");
      queryClient.invalidateQueries({ queryKey: ["owner-inspections"] });
    },
  });

  // Update item condition
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, condition, notes }: { itemId: string; condition: string; notes?: string }) => {
      const { error } = await supabase
        .from("inspection_items")
        .update({ condition, notes: notes || null })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owner-inspections"] }),
  });

  // Complete inspection
  const completeMutation = useMutation({
    mutationFn: async ({ id, overallCondition }: { id: string; overallCondition: string }) => {
      const { error } = await supabase
        .from("property_inspections")
        .update({ status: "completed", overall_condition: overallCondition, completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inspeksi selesai!");
      queryClient.invalidateQueries({ queryKey: ["owner-inspections"] });
      setDetailId(null);
    },
  });

  // Upload photo for item
  const uploadPhoto = async (itemId: string, file: File, currentPhotos: string[]) => {
    const path = `${user?.id}/${itemId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("inspection-photos").upload(path, file);
    if (uploadError) { toast.error("Gagal upload foto"); return; }

    const { data: { publicUrl } } = supabase.storage.from("inspection-photos").getPublicUrl(path);
    const newPhotos = [...currentPhotos, publicUrl];

    await supabase.from("inspection_items").update({ photo_urls: newPhotos }).eq("id", itemId);
    queryClient.invalidateQueries({ queryKey: ["owner-inspections"] });
    toast.success("Foto berhasil diupload");
  };

  const activeInspection = inspections.find((i: any) => i.id === detailId) as any;

  const upcomingInspections = inspections.filter((i: any) => ["scheduled", "pending", "in_progress"].includes(i.status));
  const completedInspections = inspections.filter((i: any) => ["completed", "disputed"].includes(i.status));

  const stats = {
    total: inspections.length,
    scheduled: inspections.filter((i: any) => i.status === "scheduled").length,
    inProgress: inspections.filter((i: any) => i.status === "in_progress").length,
    completed: inspections.filter((i: any) => i.status === "completed").length,
  };

  // Detail view
  if (detailId && activeInspection) {
    const items = (activeInspection.inspection_items || []) as any[];
    const areas = [...new Set(items.map((i: any) => i.area))];
    const allRated = items.every((i: any) => i.condition);
    const isScheduled = activeInspection.status === "scheduled";

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setDetailId(null)} className="text-xs">← Kembali</Button>
          <Badge className={`${statusColors[activeInspection.status]} border text-[10px]`}>
            {statusLabels[activeInspection.status]}
          </Badge>
        </div>

        <Card className="p-3">
          <h3 className="text-sm font-semibold">{(activeInspection as any).properties?.title || "Properti"}</h3>
          <p className="text-xs text-muted-foreground">
            {activeInspection.inspection_type === "check_in" ? "Check-In" : "Check-Out"} •{" "}
            {activeInspection.inspection_date
              ? format(new Date(activeInspection.inspection_date), "d MMM yyyy, HH:mm", { locale: idLocale })
              : new Date(activeInspection.created_at).toLocaleDateString("id-ID")}
          </p>
          {isScheduled && (
            <Button
              size="sm"
              className="mt-2 text-xs w-full"
              onClick={() => startMutation.mutate(activeInspection.id)}
              disabled={startMutation.isPending}
            >
              {startMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ClipboardCheck className="h-3.5 w-3.5 mr-1" />}
              Mulai Inspeksi Sekarang
            </Button>
          )}
        </Card>

        {!isScheduled && areas.map((area) => (
          <Card key={area} className="p-3">
            <h4 className="text-xs font-semibold mb-2">{area}</h4>
            <div className="space-y-2">
              {items.filter((i: any) => i.area === area).sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => (
                <div key={item.id} className="border border-border rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium">{item.item_name}</span>
                    {item.condition && (
                      <Badge className={`${conditionColors[item.condition]} border text-[9px]`}>
                        {conditionLabels[item.condition]}
                      </Badge>
                    )}
                  </div>
                  {activeInspection.status === "in_progress" && (
                    <div className="flex gap-1 flex-wrap mb-1.5">
                      {["excellent", "good", "fair", "poor", "damaged", "missing"].map((c) => (
                        <Button
                          key={c}
                          variant={item.condition === c ? "default" : "outline"}
                          size="sm"
                          className="h-5 text-[8px] px-1.5"
                          onClick={() => updateItemMutation.mutate({ itemId: item.id, condition: c })}
                        >
                          {conditionLabels[c]}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {(item.photo_urls || []).map((url: string, pi: number) => (
                      <img key={pi} src={url} alt="" className="w-12 h-12 rounded object-cover border border-border" />
                    ))}
                    {activeInspection.status === "in_progress" && (
                      <label className="w-12 h-12 rounded border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadPhoto(item.id, file, item.photo_urls || []);
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {activeInspection.status === "in_progress" && allRated && (
          <Card className="p-3">
            <h4 className="text-xs font-semibold mb-2">Selesaikan Inspeksi</h4>
            <div className="flex gap-1.5 flex-wrap">
              {["excellent", "good", "fair", "poor"].map((c) => (
                <Button key={c} size="sm" className="text-xs" onClick={() => completeMutation.mutate({ id: activeInspection.id, overallCondition: c })}>
                  {conditionLabels[c]}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Terjadwal", value: stats.scheduled, color: "text-accent-foreground" },
          { label: "Berlangsung", value: stats.inProgress, color: "text-chart-3" },
          { label: "Selesai", value: stats.completed, color: "text-chart-1" },
        ].map((s, i) => (
          <Card key={i} className="p-2 text-center">
            <p className="text-lg font-bold">{s.value}</p>
            <p className={`text-[9px] ${s.color}`}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Create Button */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="w-full text-xs"><Plus className="h-3.5 w-3.5 mr-1" /> Jadwalkan Inspeksi Baru</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-sm">Jadwalkan Inspeksi Properti</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Booking</Label>
              <Select value={form.bookingId} onValueChange={(v) => setForm({ ...form, bookingId: v })}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih booking" /></SelectTrigger>
                <SelectContent>
                  {bookings.map((b: any) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.properties?.title} — {b.check_in_date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipe Inspeksi</Label>
              <Select value={form.inspectionType} onValueChange={(v) => setForm({ ...form, inspectionType: v })}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="check_in" className="text-xs">Check-In</SelectItem>
                  <SelectItem value="check_out" className="text-xs">Check-Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date picker */}
            <div>
              <Label className="text-xs">Tanggal Inspeksi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left text-xs font-normal", !form.scheduledDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {form.scheduledDate ? format(form.scheduledDate, "d MMMM yyyy", { locale: idLocale }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.scheduledDate}
                    onSelect={(d) => setForm({ ...form, scheduledDate: d })}
                    disabled={(date) => isBefore(date, addDays(new Date(), -1))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time picker */}
            <div>
              <Label className="text-xs">Jam Inspeksi</Label>
              <Select value={form.scheduledTime} onValueChange={(v) => setForm({ ...form, scheduledTime: v })}>
                <SelectTrigger className="text-xs">
                  <Clock className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Catatan (opsional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-xs" rows={2} />
            </div>
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={() => createMutation.mutate()}
              disabled={!form.bookingId || !form.scheduledDate || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CalendarIcon className="h-3.5 w-3.5 mr-1" />}
              Jadwalkan Inspeksi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs: Upcoming / Completed */}
      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">Mendatang ({upcomingInspections.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Selesai ({completedInspections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-3 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : upcomingInspections.length === 0 ? (
            <Card className="p-6 text-center">
              <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-medium">Tidak ada inspeksi mendatang</p>
            </Card>
          ) : (
            upcomingInspections.map((insp: any) => {
              const itemCount = insp.inspection_items?.length || 0;
              const ratedCount = insp.inspection_items?.filter((i: any) => i.condition).length || 0;
              const inspDate = insp.inspection_date ? new Date(insp.inspection_date) : null;
              const isUpcomingToday = inspDate && isToday(inspDate);

              return (
                <Card
                  key={insp.id}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-muted/30 transition-colors",
                    isUpcomingToday && "ring-1 ring-primary/30"
                  )}
                  onClick={() => setDetailId(insp.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold">{(insp as any).properties?.title || "Properti"}</h4>
                    <Badge className={`${statusColors[insp.status]} border text-[9px]`}>
                      {statusLabels[insp.status] || insp.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{insp.inspection_type === "check_in" ? "Check-In" : "Check-Out"}</span>
                    <span>•</span>
                    <span className={isUpcomingToday ? "text-primary font-semibold" : ""}>
                      {inspDate
                        ? format(inspDate, "d MMM yyyy, HH:mm", { locale: idLocale })
                        : new Date(insp.created_at).toLocaleDateString("id-ID")}
                      {isUpcomingToday && " (Hari ini)"}
                    </span>
                    {insp.status !== "scheduled" && (
                      <>
                        <span>•</span>
                        <span>{ratedCount}/{itemCount} item</span>
                      </>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-3 space-y-3">
          {completedInspections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada inspeksi selesai</p>
          ) : (
            completedInspections.map((insp: any) => {
              const itemCount = insp.inspection_items?.length || 0;
              const ratedCount = insp.inspection_items?.filter((i: any) => i.condition).length || 0;

              return (
                <Card key={insp.id} className="p-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setDetailId(insp.id)}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold">{(insp as any).properties?.title || "Properti"}</h4>
                    <Badge className={`${statusColors[insp.status]} border text-[9px]`}>
                      {statusLabels[insp.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{insp.inspection_type === "check_in" ? "Check-In" : "Check-Out"}</span>
                    <span>•</span>
                    <span>{insp.inspection_date
                      ? format(new Date(insp.inspection_date), "d MMM yyyy", { locale: idLocale })
                      : new Date(insp.created_at).toLocaleDateString("id-ID")}</span>
                    <span>•</span>
                    <span>{ratedCount}/{itemCount} item</span>
                  </div>
                  {insp.overall_condition && (
                    <Badge className={`${conditionColors[insp.overall_condition]} border text-[9px] mt-1`}>
                      Kondisi: {conditionLabels[insp.overall_condition]}
                    </Badge>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerInspectionManagement;
