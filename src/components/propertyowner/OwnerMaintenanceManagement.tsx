import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Clock, CheckCircle, XCircle, Loader2, AlertTriangle, UserPlus, DollarSign, CalendarDays, MessageSquare, Plus } from "lucide-react";
import { useOwnerMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { useQueryClient } from "@tanstack/react-query";
import { formatIDR } from "@/utils/currency";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Terbuka", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Clock },
  in_progress: { label: "Dikerjakan", color: "bg-primary/10 text-primary border-primary/20", icon: Wrench },
  resolved: { label: "Selesai", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: "Rendah", color: "text-muted-foreground" },
  medium: { label: "Sedang", color: "text-chart-3" },
  high: { label: "Tinggi", color: "text-orange-500" },
  urgent: { label: "Darurat", color: "text-destructive" },
};

const categoryMap: Record<string, string> = {
  plumbing: "Pipa & Air", electrical: "Listrik", ac_heating: "AC / Pendingin",
  appliance: "Peralatan", structural: "Struktur Bangunan", pest: "Hama",
  cleaning: "Kebersihan", general: "Umum",
};

const OwnerMaintenanceManagement = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useOwnerMaintenanceRequests();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState("active");
  const [assignDialog, setAssignDialog] = useState<any>(null);
  const [vendorName, setVendorName] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [progressNote, setProgressNote] = useState("");

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user?.id;
        if (resolutionNotes[id]) updateData.resolution_notes = resolutionNotes[id];
      }
      const { error } = await supabase
        .from("maintenance_requests" as any)
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
      showSuccess("Berhasil", `Status diubah ke ${statusMap[status]?.label || status}`);
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const assignVendor = async () => {
    if (!assignDialog) return;
    setUpdatingId(assignDialog.id);
    try {
      const updateData: any = {
        status: "in_progress",
        assigned_vendor_name: vendorName || null,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
        scheduled_date: scheduledDate || null,
        owner_notes: ownerNotes || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("maintenance_requests" as any)
        .update(updateData)
        .eq("id", assignDialog.id);
      if (error) throw error;
      showSuccess("Berhasil", "Vendor berhasil di-assign dan status diubah ke Dikerjakan");
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      setAssignDialog(null);
      setVendorName("");
      setEstimatedCost("");
      setScheduledDate("");
      setOwnerNotes("");
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const addProgressNote = async (req: any) => {
    if (!progressNote.trim()) return;
    setUpdatingId(req.id);
    try {
      const existing = Array.isArray(req.progress_notes) ? req.progress_notes : [];
      const newNotes = [...existing, {
        note: progressNote.trim(),
        by: "owner",
        at: new Date().toISOString(),
      }];
      const { error } = await supabase
        .from("maintenance_requests" as any)
        .update({ progress_notes: newNotes, updated_at: new Date().toISOString() })
        .eq("id", req.id);
      if (error) throw error;
      showSuccess("Berhasil", "Progress note ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      setProgressNote("");
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const completeWithCost = async (req: any) => {
    setUpdatingId(req.id);
    try {
      const updateData: any = {
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id,
        updated_at: new Date().toISOString(),
      };
      if (resolutionNotes[req.id]) updateData.resolution_notes = resolutionNotes[req.id];
      if (actualCost) updateData.actual_cost = parseFloat(actualCost);
      const { error } = await supabase
        .from("maintenance_requests" as any)
        .update(updateData)
        .eq("id", req.id);
      if (error) throw error;
      showSuccess("Berhasil", "Maintenance selesai!");
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      setActualCost("");
    } catch (err: any) {
      showError("Gagal", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (requests.length === 0) {
    return (
      <Card className="p-8 border-border">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Tidak Ada Permintaan Maintenance</h3>
          <p className="text-sm text-muted-foreground">Permintaan perbaikan dari penyewa akan muncul di sini.</p>
        </div>
      </Card>
    );
  }

  const activeRequests = requests.filter((r: any) => !["resolved", "rejected"].includes(r.status));
  const closedRequests = requests.filter((r: any) => ["resolved", "rejected"].includes(r.status));
  const openCount = requests.filter((r: any) => r.status === "open").length;
  const inProgressCount = requests.filter((r: any) => r.status === "in_progress").length;
  const urgentCount = requests.filter((r: any) => ["high", "urgent"].includes(r.priority) && !["resolved", "rejected"].includes(r.status)).length;
  const totalCost = closedRequests.reduce((sum: number, r: any) => sum + (r.actual_cost || r.estimated_cost || 0), 0);

  const filteredRequests = filterTab === "active" ? activeRequests : closedRequests;

  const renderCard = (req: any) => {
    const st = statusMap[req.status] || statusMap.open;
    const pr = priorityMap[req.priority] || priorityMap.medium;
    const StatusIcon = st.icon;
    const isActive = !["resolved", "rejected"].includes(req.status);
    const hasImages = req.images && req.images.length > 0;
    const notes = Array.isArray(req.progress_notes) ? req.progress_notes : [];

    return (
      <Card key={req.id} className={`p-3 border-border ${req.priority === "urgent" && isActive ? "ring-1 ring-destructive/30" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-foreground">{req.title}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              <span className="text-muted-foreground">{categoryMap[req.category] || req.category}</span>
              <span className={`font-medium ${pr.color}`}>
                {req.priority === "urgent" && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
                {pr.label}
              </span>
            </div>
          </div>
          <Badge className={`${st.color} text-[9px] border`}>
            <StatusIcon className="h-2.5 w-2.5 mr-0.5" /> {st.label}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground mb-2">{req.description}</p>

        {/* Photo thumbnails */}
        {hasImages && (
          <div className="flex gap-1.5 mb-2">
            {req.images.map((url: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setLightboxImg(url)}
                className="w-12 h-12 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary/30 transition-all flex-shrink-0"
              >
                <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Vendor & cost info */}
        {(req.assigned_vendor_name || req.estimated_cost || req.scheduled_date) && (
          <div className="bg-muted/40 rounded-md p-2 mb-2 space-y-0.5">
            {req.assigned_vendor_name && (
              <div className="flex items-center gap-1 text-[10px]">
                <UserPlus className="h-2.5 w-2.5 text-primary" />
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium text-foreground">{req.assigned_vendor_name}</span>
              </div>
            )}
            {req.estimated_cost && (
              <div className="flex items-center gap-1 text-[10px]">
                <DollarSign className="h-2.5 w-2.5 text-chart-3" />
                <span className="text-muted-foreground">Estimasi:</span>
                <span className="font-medium text-foreground">{formatIDR(req.estimated_cost)}</span>
                {req.actual_cost && (
                  <span className="text-chart-1 font-medium ml-1">• Aktual: {formatIDR(req.actual_cost)}</span>
                )}
              </div>
            )}
            {req.scheduled_date && (
              <div className="flex items-center gap-1 text-[10px]">
                <CalendarDays className="h-2.5 w-2.5 text-chart-5" />
                <span className="text-muted-foreground">Dijadwalkan:</span>
                <span className="font-medium text-foreground">{format(new Date(req.scheduled_date), "d MMM yyyy", { locale: idLocale })}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress notes timeline */}
        {notes.length > 0 && (
          <div className="mb-2 space-y-1">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Progress</p>
            {notes.map((n: any, idx: number) => (
              <div key={idx} className="flex gap-1.5 text-[10px]">
                <div className="w-1 bg-primary/30 rounded-full flex-shrink-0 mt-0.5" style={{ minHeight: 12 }} />
                <div>
                  <p className="text-foreground">{n.note}</p>
                  <p className="text-[8px] text-muted-foreground">{n.at ? format(new Date(n.at), "d MMM HH:mm", { locale: idLocale }) : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active actions */}
        {isActive && (
          <div className="space-y-2 border-t border-border pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Select value={req.status} onValueChange={(val) => updateStatus(req.id, val)} disabled={updatingId === req.id}>
                <SelectTrigger className="h-7 text-[10px] w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Terbuka</SelectItem>
                  <SelectItem value="in_progress">Dikerjakan</SelectItem>
                  <SelectItem value="resolved">Selesai</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              {!req.assigned_vendor_name && (
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => {
                  setVendorName("");
                  setEstimatedCost("");
                  setScheduledDate("");
                  setOwnerNotes(req.owner_notes || "");
                  setAssignDialog(req);
                }}>
                  <UserPlus className="h-3 w-3 mr-1" /> Assign Vendor
                </Button>
              )}
              {updatingId === req.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>

            {/* Add progress note */}
            {req.status === "in_progress" && (
              <div className="flex gap-1.5">
                <Input
                  placeholder="Tambah progress note..."
                  value={progressNote}
                  onChange={e => setProgressNote(e.target.value)}
                  className="h-7 text-[10px] flex-1"
                  onKeyDown={e => e.key === "Enter" && addProgressNote(req)}
                />
                <Button size="sm" className="h-7 px-2" onClick={() => addProgressNote(req)} disabled={!progressNote.trim() || updatingId === req.id}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Complete with cost */}
            {req.status === "in_progress" && (
              <div className="flex gap-1.5 items-end">
                <div className="flex-1">
                  <Textarea
                    placeholder="Catatan penyelesaian..."
                    value={resolutionNotes[req.id] || ""}
                    onChange={e => setResolutionNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                    className="text-[10px] min-h-[40px]"
                  />
                </div>
                <div className="w-24">
                  <Input
                    placeholder="Biaya aktual"
                    value={actualCost}
                    onChange={e => setActualCost(e.target.value)}
                    type="number"
                    className="h-7 text-[10px]"
                  />
                </div>
                <Button size="sm" className="h-7 text-[10px]" onClick={() => completeWithCost(req)} disabled={updatingId === req.id}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Selesai
                </Button>
              </div>
            )}
          </div>
        )}

        {req.resolution_notes && (
          <div className="bg-muted/50 rounded-md p-2 text-[10px] text-foreground mt-2">
            <span className="font-medium">Catatan: </span>{req.resolution_notes}
          </div>
        )}
        <p className="text-[8px] text-muted-foreground mt-1.5">
          {format(new Date(req.created_at), "d MMM yyyy", { locale: idLocale })}
          {req.resolved_at && ` • Selesai ${format(new Date(req.resolved_at), "d MMM", { locale: idLocale })}`}
        </p>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-2.5 border-border">
          <p className="text-[9px] text-muted-foreground">Terbuka</p>
          <p className="text-lg font-bold text-chart-3">{openCount}</p>
        </Card>
        <Card className="p-2.5 border-border">
          <p className="text-[9px] text-muted-foreground">Dikerjakan</p>
          <p className="text-lg font-bold text-primary">{inProgressCount}</p>
        </Card>
        <Card className="p-2.5 border-border">
          <p className="text-[9px] text-muted-foreground">Mendesak</p>
          <p className="text-lg font-bold text-destructive">{urgentCount}</p>
        </Card>
        <Card className="p-2.5 border-border">
          <p className="text-[9px] text-muted-foreground">Total Biaya</p>
          <p className="text-sm font-bold text-foreground">{formatIDR(totalCost)}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={filterTab} onValueChange={setFilterTab}>
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1 text-xs">Aktif ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="closed" className="flex-1 text-xs">Selesai ({closedRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-2 mt-2">
          {activeRequests.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Tidak ada permintaan aktif</p>
          ) : activeRequests.map(renderCard)}
        </TabsContent>
        <TabsContent value="closed" className="space-y-2 mt-2">
          {closedRequests.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Belum ada permintaan selesai</p>
          ) : closedRequests.map(renderCard)}
        </TabsContent>
      </Tabs>

      {/* Assign Vendor Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={(o) => !o && setAssignDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm text-foreground">Assign Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-md p-2.5">
              <p className="text-xs font-medium text-foreground">{assignDialog?.title}</p>
              <p className="text-[10px] text-muted-foreground">{categoryMap[assignDialog?.category] || assignDialog?.category} • {priorityMap[assignDialog?.priority]?.label}</p>
            </div>
            <div>
              <Label className="text-xs">Nama Vendor / Teknisi</Label>
              <Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Nama vendor atau teknisi..." className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Estimasi Biaya (IDR)</Label>
                <Input value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} type="number" placeholder="0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tanggal Jadwal</Label>
                <Input value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} type="date" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Catatan (opsional)</Label>
              <Textarea value={ownerNotes} onChange={e => setOwnerNotes(e.target.value)} placeholder="Instruksi untuk vendor..." rows={2} className="mt-1" />
            </div>
            <Button className="w-full" onClick={assignVendor} disabled={!vendorName.trim() || updatingId === assignDialog?.id}>
              {updatingId === assignDialog?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Assign & Mulai Pengerjaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
        <DialogContent className="max-w-lg p-2">
          {lightboxImg && (
            <img src={lightboxImg} alt="Foto maintenance" className="w-full rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerMaintenanceManagement;
