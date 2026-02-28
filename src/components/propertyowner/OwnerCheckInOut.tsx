import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Price from "@/components/ui/Price";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import browserImageCompression from "browser-image-compression";
import {
  LogIn, LogOut, Loader2, Camera, CheckCircle, Clock, AlertTriangle,
  Building, User, Calendar, Zap, ImageIcon, Plus, Trash2
} from "lucide-react";

const DEFAULT_CHECKLIST = [
  { id: "walls", label: "Dinding & Cat", checked: false },
  { id: "floors", label: "Lantai", checked: false },
  { id: "windows", label: "Jendela & Kaca", checked: false },
  { id: "doors", label: "Pintu & Kunci", checked: false },
  { id: "plumbing", label: "Pipa & Keran", checked: false },
  { id: "electrical", label: "Listrik & Saklar", checked: false },
  { id: "ac", label: "AC / Pendingin", checked: false },
  { id: "kitchen", label: "Dapur & Peralatan", checked: false },
  { id: "bathroom", label: "Kamar Mandi", checked: false },
  { id: "furniture", label: "Furnitur", checked: false },
  { id: "garden", label: "Taman / Halaman", checked: false },
  { id: "parking", label: "Parkir / Garasi", checked: false },
];

const CONDITION_OPTIONS = [
  { value: "excellent", label: "Sangat Baik", color: "text-chart-1" },
  { value: "good", label: "Baik", color: "text-primary" },
  { value: "fair", label: "Cukup", color: "text-chart-3" },
  { value: "poor", label: "Kurang", color: "text-destructive" },
  { value: "damaged", label: "Rusak", color: "text-destructive" },
];

interface CheckInOutRecord {
  id: string;
  booking_id: string;
  property_id: string;
  tenant_id: string;
  record_type: string;
  overall_condition: string;
  condition_notes: string | null;
  photos: string[];
  checklist: any[];
  electricity_meter: number | null;
  water_meter: number | null;
  gas_meter: number | null;
  keys_count: number;
  keys_notes: string | null;
  inventory_notes: string | null;
  damages_found: boolean;
  damage_description: string | null;
  damage_photos: string[];
  estimated_repair_cost: number;
  deduct_from_deposit: boolean;
  status: string;
  owner_agreed: boolean;
  tenant_agreed: boolean;
  created_at: string;
  booking?: any;
  property?: any;
  tenant?: any;
}

const OwnerCheckInOut = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<CheckInOutRecord[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState("active");

  // Form state
  const [selectedBooking, setSelectedBooking] = useState("");
  const [recordType, setRecordType] = useState<"checkin" | "checkout">("checkin");
  const [condition, setCondition] = useState("good");
  const [conditionNotes, setConditionNotes] = useState("");
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST.map(c => ({ ...c })));
  const [electricityMeter, setElectricityMeter] = useState("");
  const [waterMeter, setWaterMeter] = useState("");
  const [keysCount, setKeysCount] = useState("1");
  const [keysNotes, setKeysNotes] = useState("");
  const [inventoryNotes, setInventoryNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [damagesFound, setDamagesFound] = useState(false);
  const [damageDescription, setDamageDescription] = useState("");
  const [estimatedRepairCost, setEstimatedRepairCost] = useState("");
  const [deductFromDeposit, setDeductFromDeposit] = useState(false);
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  const [viewRecord, setViewRecord] = useState<CheckInOutRecord | null>(null);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: props } = await supabase.from("properties").select("id, title, city").eq("owner_id", user.id);
      if (!props?.length) { setRecords([]); setBookings([]); setLoading(false); return; }
      const propIds = props.map(p => p.id);

      const [recordsRes, bookingsRes] = await Promise.all([
        supabase.from("checkin_checkout_records" as any).select("*").in("property_id", propIds).order("created_at", { ascending: false }),
        supabase.from("rental_bookings").select("id, property_id, customer_id, check_in_date, check_out_date, total_amount, booking_status").in("property_id", propIds).in("booking_status", ["confirmed", "completed"]),
      ]);

      const customerIds = [...new Set((bookingsRes.data || []).map((b: any) => b.customer_id).filter(Boolean))];
      const { data: profiles } = customerIds.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", customerIds)
        : { data: [] };

      const enrichedRecords = (recordsRes.data || []).map((r: any) => {
        const booking = (bookingsRes.data || []).find((b: any) => b.id === r.booking_id);
        const property = props.find(p => p.id === r.property_id);
        const tenant = (profiles || []).find((p: any) => p.id === r.tenant_id);
        return { ...r, booking, property, tenant };
      });

      setRecords(enrichedRecords);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, folder: string): Promise<string | null> => {
    try {
      const compressed = await browserImageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200 });
      const fileName = `${user!.id}/${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await supabase.storage.from("checkin-photos").upload(fileName, compressed, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("checkin-photos").getPublicUrl(fileName);
      return publicUrl;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isDamage = false) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files.slice(0, 4)) {
      const url = await uploadPhoto(file, isDamage ? "damage" : "condition");
      if (url) urls.push(url);
    }
    if (isDamage) setDamagePhotos(prev => [...prev, ...urls]);
    else setPhotos(prev => [...prev, ...urls]);
    setUploading(false);
    e.target.value = "";
  };

  const handleCreate = async () => {
    if (!selectedBooking || !user?.id) return;
    const booking = bookings.find(b => b.id === selectedBooking);
    if (!booking) return;
    setCreating(true);
    try {
      const { error } = await supabase.from("checkin_checkout_records" as any).insert({
        booking_id: selectedBooking,
        property_id: booking.property_id,
        tenant_id: booking.customer_id,
        record_type: recordType,
        performed_by: user.id,
        overall_condition: condition,
        condition_notes: conditionNotes || null,
        photos,
        checklist,
        electricity_meter: electricityMeter ? Number(electricityMeter) : null,
        water_meter: waterMeter ? Number(waterMeter) : null,
        keys_count: Number(keysCount) || 0,
        keys_notes: keysNotes || null,
        inventory_notes: inventoryNotes || null,
        damages_found: damagesFound,
        damage_description: damagesFound ? damageDescription || null : null,
        damage_photos: damagesFound ? damagePhotos : [],
        estimated_repair_cost: damagesFound ? Number(estimatedRepairCost) || 0 : 0,
        deduct_from_deposit: deductFromDeposit,
        owner_agreed: true,
        owner_signature_at: new Date().toISOString(),
        status: "draft",
      });
      if (error) throw error;
      toast.success(`${recordType === "checkin" ? "Check-in" : "Check-out"} record berhasil dibuat`);
      setShowCreate(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal membuat record: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedBooking("");
    setRecordType("checkin");
    setCondition("good");
    setConditionNotes("");
    setChecklist(DEFAULT_CHECKLIST.map(c => ({ ...c })));
    setElectricityMeter("");
    setWaterMeter("");
    setKeysCount("1");
    setKeysNotes("");
    setInventoryNotes("");
    setPhotos([]);
    setDamagesFound(false);
    setDamageDescription("");
    setEstimatedRepairCost("");
    setDeductFromDeposit(false);
    setDamagePhotos([]);
  };

  const markCompleted = async (id: string) => {
    const { error } = await supabase.from("checkin_checkout_records" as any).update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Gagal"); return; }
    toast.success("Record selesai");
    fetchData();
  };

  const activeRecords = records.filter(r => r.status === "draft");
  const completedRecords = records.filter(r => r.status !== "draft");

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: LogIn, label: "Check-in", value: records.filter(r => r.record_type === "checkin").length, color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: LogOut, label: "Check-out", value: records.filter(r => r.record_type === "checkout").length, color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: AlertTriangle, label: "Kerusakan", value: records.filter(r => r.damages_found).length, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((s, i) => (
          <Card key={i} className="p-2.5">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <span className="text-base font-bold block leading-none">{s.value}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Button */}
      <Button size="sm" className="w-full h-9 text-xs" onClick={() => setShowCreate(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Buat Check-in / Check-out Baru
      </Button>

      {/* Records List */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full h-8">
          <TabsTrigger value="active" className="flex-1 text-xs">Aktif ({activeRecords.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-xs">Selesai ({completedRecords.length})</TabsTrigger>
        </TabsList>

        {["active", "completed"].map(t => (
          <TabsContent key={t} value={t} className="space-y-2 mt-2">
            {(t === "active" ? activeRecords : completedRecords).length === 0 ? (
              <Card className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Tidak ada record {t === "active" ? "aktif" : "selesai"}</p>
              </Card>
            ) : (
              (t === "active" ? activeRecords : completedRecords).map(r => (
                <Card key={r.id} className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${r.record_type === "checkin" ? "bg-chart-1/10" : "bg-chart-3/10"}`}>
                        {r.record_type === "checkin" ? <LogIn className="h-4 w-4 text-chart-1" /> : <LogOut className="h-4 w-4 text-chart-3" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{r.property?.title || "Properti"}</p>
                        <p className="text-[10px] text-muted-foreground">{r.tenant?.full_name || "Tenant"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={r.record_type === "checkin" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0.5 h-auto">
                        {r.record_type === "checkin" ? "Check-in" : "Check-out"}
                      </Badge>
                      <Badge variant={r.status === "completed" ? "default" : "outline"} className="text-[8px] px-1 py-0 h-auto">
                        {r.status === "completed" ? "Selesai" : "Draft"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                    <div className="bg-muted/40 rounded p-1.5">
                      <p className="text-muted-foreground">Kondisi</p>
                      <p className="font-medium">{CONDITION_OPTIONS.find(c => c.value === r.overall_condition)?.label || r.overall_condition}</p>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5">
                      <p className="text-muted-foreground">Kunci</p>
                      <p className="font-medium">{r.keys_count} buah</p>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5">
                      <p className="text-muted-foreground">Foto</p>
                      <p className="font-medium">{(r.photos || []).length} foto</p>
                    </div>
                  </div>

                  {r.damages_found && (
                    <div className="bg-destructive/10 rounded-lg p-2 mb-2">
                      <p className="text-[10px] font-medium text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Kerusakan ditemukan
                      </p>
                      {r.damage_description && <p className="text-[9px] text-muted-foreground mt-0.5">{r.damage_description}</p>}
                      {r.estimated_repair_cost > 0 && <p className="text-[9px] font-medium mt-0.5">Estimasi: <Price amount={r.estimated_repair_cost} /></p>}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" onClick={() => setViewRecord(r)}>
                      Detail
                    </Button>
                    {r.status === "draft" && (
                      <Button size="sm" className="h-7 text-[10px] flex-1" onClick={() => markCompleted(r.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Selesaikan
                      </Button>
                    )}
                  </div>

                  <p className="text-[9px] text-muted-foreground mt-1.5">
                    {format(new Date(r.created_at), "dd MMM yyyy HH:mm", { locale: idLocale })}
                  </p>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" /> Buat Check-in / Check-out
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Booking & Type */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Booking</Label>
                <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pilih booking" /></SelectTrigger>
                  <SelectContent>
                    {bookings.map(b => (
                      <SelectItem key={b.id} value={b.id} className="text-xs">
                        {b.check_in_date} → {b.check_out_date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Tipe</Label>
                <Select value={recordType} onValueChange={(v: "checkin" | "checkout") => setRecordType(v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkin">Check-in</SelectItem>
                    <SelectItem value="checkout">Check-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Overall Condition */}
            <div>
              <Label className="text-xs">Kondisi Keseluruhan</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Checklist */}
            <div>
              <Label className="text-xs mb-1.5 block">Checklist Kondisi</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {checklist.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-1.5">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => {
                        const updated = [...checklist];
                        updated[idx] = { ...updated[idx], checked: !!checked };
                        setChecklist(updated);
                      }}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-[10px]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meter Readings */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Meteran Listrik</Label>
                <Input type="number" value={electricityMeter} onChange={e => setElectricityMeter(e.target.value)} className="h-8 text-xs" placeholder="kWh" />
              </div>
              <div>
                <Label className="text-xs">Meteran Air</Label>
                <Input type="number" value={waterMeter} onChange={e => setWaterMeter(e.target.value)} className="h-8 text-xs" placeholder="m³" />
              </div>
            </div>

            {/* Keys */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Jumlah Kunci</Label>
                <Input type="number" value={keysCount} onChange={e => setKeysCount(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Catatan Kunci</Label>
                <Input value={keysNotes} onChange={e => setKeysNotes(e.target.value)} className="h-8 text-xs" placeholder="Opsional" />
              </div>
            </div>

            {/* Condition Notes */}
            <div>
              <Label className="text-xs">Catatan Kondisi</Label>
              <Textarea value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} className="text-xs h-16" placeholder="Catatan tentang kondisi properti..." />
            </div>

            {/* Photos */}
            <div>
              <Label className="text-xs mb-1 block">Foto Kondisi (maks 4)</Label>
              <div className="flex gap-2 flex-wrap">
                {photos.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}>
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <label className="w-16 h-16 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 text-muted-foreground" />}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e)} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Damage Section (for checkout) */}
            {recordType === "checkout" && (
              <div className="border border-destructive/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={damagesFound} onCheckedChange={(c) => setDamagesFound(!!c)} className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium text-destructive">Kerusakan Ditemukan</span>
                </div>
                {damagesFound && (
                  <>
                    <Textarea value={damageDescription} onChange={e => setDamageDescription(e.target.value)} className="text-xs h-16" placeholder="Deskripsi kerusakan..." />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Estimasi Biaya Perbaikan</Label>
                        <Input type="number" value={estimatedRepairCost} onChange={e => setEstimatedRepairCost(e.target.value)} className="h-8 text-xs" placeholder="IDR" />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-1.5">
                          <Checkbox checked={deductFromDeposit} onCheckedChange={(c) => setDeductFromDeposit(!!c)} className="h-3.5 w-3.5" />
                          <span className="text-[10px]">Potong dari deposit</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Foto Kerusakan</Label>
                      <div className="flex gap-2 flex-wrap">
                        {damagePhotos.map((url, i) => (
                          <div key={i} className="relative w-14 h-14 rounded-md overflow-hidden border border-destructive/30">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5" onClick={() => setDamagePhotos(prev => prev.filter((_, j) => j !== i))}>
                              <Trash2 className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                        {damagePhotos.length < 4 && (
                          <label className="w-14 h-14 rounded-md border-2 border-dashed border-destructive/30 flex items-center justify-center cursor-pointer">
                            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3 text-destructive" />}
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e, true)} disabled={uploading} />
                          </label>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCreate(false)}>Batal</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate} disabled={creating || !selectedBooking}>
              {creating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={(o) => !o && setViewRecord(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Detail {viewRecord?.record_type === "checkin" ? "Check-in" : "Check-out"}</DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Properti</span>
                  <span className="font-medium">{viewRecord.property?.title || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tenant</span>
                  <span className="font-medium">{viewRecord.tenant?.full_name || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Kondisi</span>
                  <span className="font-medium">{CONDITION_OPTIONS.find(c => c.value === viewRecord.overall_condition)?.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Kunci</span>
                  <span className="font-medium">{viewRecord.keys_count} buah</span>
                </div>
                {viewRecord.electricity_meter && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Listrik</span>
                    <span className="font-medium">{viewRecord.electricity_meter} kWh</span>
                  </div>
                )}
                {viewRecord.water_meter && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Air</span>
                    <span className="font-medium">{viewRecord.water_meter} m³</span>
                  </div>
                )}
              </div>

              {viewRecord.condition_notes && (
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-[10px] text-muted-foreground">Catatan:</p>
                  <p className="text-xs">{viewRecord.condition_notes}</p>
                </div>
              )}

              {/* Checklist */}
              {viewRecord.checklist?.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Checklist</p>
                  <div className="grid grid-cols-2 gap-1">
                    {(viewRecord.checklist as any[]).map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-1 text-[10px]">
                        {item.checked ? <CheckCircle className="h-3 w-3 text-chart-1" /> : <Clock className="h-3 w-3 text-muted-foreground" />}
                        <span className={item.checked ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {viewRecord.photos?.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Foto Kondisi</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {viewRecord.photos.map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-md border border-border" />
                    ))}
                  </div>
                </div>
              )}

              {viewRecord.damages_found && (
                <div className="bg-destructive/10 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-destructive mb-1">Kerusakan</p>
                  <p className="text-[10px]">{viewRecord.damage_description}</p>
                  {viewRecord.estimated_repair_cost > 0 && (
                    <p className="text-[10px] font-medium mt-1">Estimasi: <Price amount={viewRecord.estimated_repair_cost} /></p>
                  )}
                  {viewRecord.damage_photos?.length > 0 && (
                    <div className="grid grid-cols-4 gap-1 mt-1.5">
                      {viewRecord.damage_photos.map((url: string, i: number) => (
                        <img key={i} src={url} alt="" className="w-full h-14 object-cover rounded border border-destructive/30" />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerCheckInOut;
