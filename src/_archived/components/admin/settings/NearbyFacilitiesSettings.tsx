import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Plus, Edit2, Trash2, Save, X, GripVertical,
  Train, Plane, GraduationCap, ShoppingBag, Store, Hospital,
  Trees, Dumbbell, UtensilsCrossed, Fuel, Church, Coffee,
  Waves, Navigation, ParkingCircle, CreditCard, Zap, Landmark,
  TrendingUp, Globe, Eye, CheckCircle2, Settings2
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface FacilityOption {
  id: string;
  value: string;
  label: string;
  icon: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

interface PaymentOption {
  id: string;
  value: string;
  label: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

const ICON_MAP: Record<string, any> = {
  Train, Plane, GraduationCap, ShoppingBag, Store, Hospital,
  Trees, Dumbbell, UtensilsCrossed, Fuel, Church, Coffee,
  Waves, Navigation, ParkingCircle, MapPin, CreditCard, Zap,
  Landmark, TrendingUp, Globe, Eye,
};

const FACILITY_CATEGORIES = [
  { value: "transport", label: "Transportasi" },
  { value: "education", label: "Pendidikan" },
  { value: "shopping", label: "Belanja" },
  { value: "health", label: "Kesehatan" },
  { value: "lifestyle", label: "Gaya Hidup" },
  { value: "religious", label: "Ibadah" },
  { value: "nature", label: "Alam & Taman" },
  { value: "services", label: "Layanan" },
];

// Default facilities data (stored in local state, expandable to DB later)
const DEFAULT_FACILITIES: FacilityOption[] = [
  { id: "1", value: "public_transport", label: "Transportasi Umum", icon: "Train", category: "transport", is_active: true, display_order: 1 },
  { id: "2", value: "lrt_mrt", label: "LRT / MRT", icon: "Train", category: "transport", is_active: true, display_order: 2 },
  { id: "3", value: "airport", label: "Bandara", icon: "Plane", category: "transport", is_active: true, display_order: 3 },
  { id: "4", value: "toll_road", label: "Jalan Tol", icon: "Navigation", category: "transport", is_active: true, display_order: 4 },
  { id: "5", value: "international_school", label: "Sekolah Internasional", icon: "GraduationCap", category: "education", is_active: true, display_order: 5 },
  { id: "6", value: "university", label: "Universitas / Kampus", icon: "GraduationCap", category: "education", is_active: true, display_order: 6 },
  { id: "7", value: "shopping_mall", label: "Mall / Pusat Perbelanjaan", icon: "ShoppingBag", category: "shopping", is_active: true, display_order: 7 },
  { id: "8", value: "minimarket", label: "Indomaret / Alfamart", icon: "Store", category: "shopping", is_active: true, display_order: 8 },
  { id: "9", value: "supermarket", label: "Supermarket", icon: "ShoppingBag", category: "shopping", is_active: true, display_order: 9 },
  { id: "10", value: "hospital", label: "Rumah Sakit / Klinik", icon: "Hospital", category: "health", is_active: true, display_order: 10 },
  { id: "11", value: "restaurant", label: "Restoran / Kafe", icon: "UtensilsCrossed", category: "lifestyle", is_active: true, display_order: 11 },
  { id: "12", value: "park", label: "Taman / Ruang Hijau", icon: "Trees", category: "nature", is_active: true, display_order: 12 },
  { id: "13", value: "public_garden", label: "Kebun Raya / Botanical", icon: "Trees", category: "nature", is_active: true, display_order: 13 },
  { id: "14", value: "golf_club", label: "Golf Club", icon: "MapPin", category: "lifestyle", is_active: true, display_order: 14 },
  { id: "15", value: "gym_fitness", label: "Gym / Fitness Center", icon: "Dumbbell", category: "lifestyle", is_active: true, display_order: 15 },
  { id: "16", value: "beach", label: "Pantai", icon: "Waves", category: "nature", is_active: true, display_order: 16 },
  { id: "17", value: "mosque_temple", label: "Masjid / Tempat Ibadah", icon: "Church", category: "religious", is_active: true, display_order: 17 },
  { id: "18", value: "gas_station", label: "SPBU / Pom Bensin", icon: "Fuel", category: "services", is_active: true, display_order: 18 },
  { id: "19", value: "coworking", label: "Co-Working Space", icon: "Coffee", category: "lifestyle", is_active: true, display_order: 19 },
  { id: "20", value: "popular_area", label: "Area Populer / Wisata", icon: "MapPin", category: "lifestyle", is_active: true, display_order: 20 },
  { id: "21", value: "parking_area", label: "Area Parkir Luas", icon: "ParkingCircle", category: "services", is_active: true, display_order: 21 },
];

const DEFAULT_PAYMENTS: PaymentOption[] = [
  { id: "1", value: "online", label: "Online Payment", icon: "Zap", is_active: true, display_order: 1 },
  { id: "2", value: "pay_on_property", label: "Bayar di Lokasi", icon: "Store", is_active: true, display_order: 2 },
  { id: "3", value: "bank_transfer", label: "Transfer Bank", icon: "Landmark", is_active: true, display_order: 3 },
  { id: "4", value: "installment", label: "Cicilan / KPR", icon: "TrendingUp", is_active: true, display_order: 4 },
  { id: "5", value: "crypto", label: "Crypto / Digital", icon: "Globe", is_active: true, display_order: 5 },
];

const NearbyFacilitiesSettings = () => {
  const queryClient = useQueryClient();
  const [facilities, setFacilities] = useState<FacilityOption[]>(DEFAULT_FACILITIES);
  const [payments, setPayments] = useState<PaymentOption[]>(DEFAULT_PAYMENTS);
  const [editDialog, setEditDialog] = useState<{ open: boolean; type: 'facility' | 'payment'; item?: any }>({ open: false, type: 'facility' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [formData, setFormData] = useState({ value: "", label: "", icon: "MapPin", category: "transport", display_order: 0 });

  // Load from DB
  const { data: dbSettings } = useQuery({
    queryKey: ['system-settings', 'filter_options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('key', ['nearby_facilities', 'payment_methods']);
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (dbSettings) {
      const facRow = dbSettings.find((s: any) => s.key === 'nearby_facilities');
      const payRow = dbSettings.find((s: any) => s.key === 'payment_methods');
      if (facRow?.value) {
        const arr = (Array.isArray(facRow.value) ? facRow.value : []) as any[];
        setFacilities(arr.map((f: any, i: number) => ({ ...f, id: f.id || String(i + 1), display_order: f.display_order || i + 1 })));
      }
      if (payRow?.value) {
        const arr = (Array.isArray(payRow.value) ? payRow.value : []) as any[];
        setPayments(arr.map((p: any, i: number) => ({ ...p, id: p.id || String(i + 1), display_order: p.display_order || i + 1 })));
      }
    }
  }, [dbSettings]);

  // Persist to DB
  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  const persistFacilities = (updated: FacilityOption[]) => {
    setFacilities(updated);
    saveMutation.mutate({ key: 'nearby_facilities', value: updated });
  };

  const persistPayments = (updated: PaymentOption[]) => {
    setPayments(updated);
    saveMutation.mutate({ key: 'payment_methods', value: updated });
  };

  const handleToggleFacility = (id: string) => {
    const updated = facilities.map(f => f.id === id ? { ...f, is_active: !f.is_active } : f);
    persistFacilities(updated);
  };

  const handleTogglePayment = (id: string) => {
    const updated = payments.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p);
    persistPayments(updated);
  };

  const handleAddFacility = () => {
    if (!formData.value || !formData.label) return;
    const newFacility: FacilityOption = {
      id: Date.now().toString(),
      value: formData.value.toLowerCase().replace(/\s+/g, '_'),
      label: formData.label,
      icon: formData.icon,
      category: formData.category,
      is_active: true,
      display_order: facilities.length + 1,
    };
    persistFacilities([...facilities, newFacility]);
    setEditDialog({ open: false, type: 'facility' });
    setFormData({ value: "", label: "", icon: "MapPin", category: "transport", display_order: 0 });
  };

  const handleAddPayment = () => {
    if (!formData.value || !formData.label) return;
    const newPayment: PaymentOption = {
      id: Date.now().toString(),
      value: formData.value.toLowerCase().replace(/\s+/g, '_'),
      label: formData.label,
      icon: formData.icon,
      is_active: true,
      display_order: payments.length + 1,
    };
    persistPayments([...payments, newPayment]);
    setEditDialog({ open: false, type: 'payment' });
    setFormData({ value: "", label: "", icon: "MapPin", category: "transport", display_order: 0 });
  };

  const handleDeleteFacility = (id: string) => {
    persistFacilities(facilities.filter(f => f.id !== id));
    setDeleteConfirm(null);
  };

  const handleDeletePayment = (id: string) => {
    persistPayments(payments.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const filteredFacilities = filterCategory === "all"
    ? facilities
    : facilities.filter(f => f.category === filterCategory);

  const activeFacilities = facilities.filter(f => f.is_active).length;
  const activePayments = payments.filter(p => p.is_active).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Nearby & Payment Settings</h2>
          </div>
          <p className="text-muted-foreground">Manage nearby facility options and payment methods for property listings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Facilities</p>
                <p className="text-2xl font-bold">{facilities.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Facilities</p>
                <p className="text-2xl font-bold text-chart-1">{activeFacilities}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-chart-1/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment Methods</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Payments</p>
                <p className="text-2xl font-bold text-chart-1">{activePayments}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-chart-1/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="facilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="facilities">🏢 Nearby Facilities ({facilities.length})</TabsTrigger>
          <TabsTrigger value="payments">💳 Payment Methods ({payments.length})</TabsTrigger>
        </TabsList>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FACILITY_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => { setFormData({ value: "", label: "", icon: "MapPin", category: "transport", display_order: 0 }); setEditDialog({ open: true, type: 'facility' }); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Facility
            </Button>
          </div>

          <div className="space-y-2">
            {filteredFacilities.map(facility => {
              const IconComp = ICON_MAP[facility.icon] || MapPin;
              const catLabel = FACILITY_CATEGORIES.find(c => c.value === facility.category)?.label || facility.category;
              return (
                <div key={facility.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  facility.is_active ? "bg-card border-border hover:border-primary/40" : "bg-muted/30 border-border/40 opacity-60"
                )}>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <IconComp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{facility.label}</span>
                      <Badge variant="outline" className="text-[10px] h-5">{catLabel}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{facility.value}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch checked={facility.is_active} onCheckedChange={() => handleToggleFacility(facility.id)} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteConfirm(`f-${facility.id}`)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-end">
            <Button onClick={() => { setFormData({ value: "", label: "", icon: "CreditCard", category: "", display_order: 0 }); setEditDialog({ open: true, type: 'payment' }); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Payment Method
            </Button>
          </div>

          <div className="space-y-2">
            {payments.map(payment => {
              const IconComp = ICON_MAP[payment.icon] || CreditCard;
              return (
                <div key={payment.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  payment.is_active ? "bg-card border-border hover:border-primary/40" : "bg-muted/30 border-border/40 opacity-60"
                )}>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <div className="h-8 w-8 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                    <IconComp className="h-4 w-4 text-chart-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{payment.label}</span>
                    <p className="text-xs text-muted-foreground font-mono">{payment.value}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch checked={payment.is_active} onCheckedChange={() => handleTogglePayment(payment.id)} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteConfirm(`p-${payment.id}`)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDialog.type === 'facility' ? 'Add Nearby Facility' : 'Add Payment Method'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Value (key)</Label>
              <Input value={formData.value} onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))} placeholder="e.g. swimming_pool" className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Display Label</Label>
              <Input value={formData.label} onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))} placeholder="e.g. Kolam Renang" className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Icon</Label>
                <Select value={formData.icon} onValueChange={v => setFormData(prev => ({ ...prev, icon: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(ICON_MAP).map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editDialog.type === 'facility' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FACILITY_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditDialog({ open: false, type: 'facility' })}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={editDialog.type === 'facility' ? handleAddFacility : handleAddPayment} disabled={!formData.value || !formData.label}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteConfirm?.startsWith('f-')) handleDeleteFacility(deleteConfirm.slice(2));
              else if (deleteConfirm?.startsWith('p-')) handleDeletePayment(deleteConfirm.slice(2));
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NearbyFacilitiesSettings;
