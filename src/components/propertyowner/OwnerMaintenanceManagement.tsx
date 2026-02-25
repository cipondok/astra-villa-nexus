import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useOwnerMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { useQueryClient } from "@tanstack/react-query";

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

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const updateData: any = { status };
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

  const openCount = requests.filter((r: any) => r.status === "open").length;
  const inProgressCount = requests.filter((r: any) => r.status === "in_progress").length;
  const urgentCount = requests.filter((r: any) => ["high", "urgent"].includes(r.priority) && !["resolved", "rejected"].includes(r.status)).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Terbuka</p>
          <p className="text-xl font-bold text-chart-3">{openCount}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Dikerjakan</p>
          <p className="text-xl font-bold text-primary">{inProgressCount}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Mendesak</p>
          <p className="text-xl font-bold text-destructive">{urgentCount}</p>
        </Card>
      </div>

      {/* Request list */}
      <div className="space-y-3">
        {requests.map((req: any) => {
          const st = statusMap[req.status] || statusMap.open;
          const pr = priorityMap[req.priority] || priorityMap.medium;
          const StatusIcon = st.icon;
          const isActive = !["resolved", "rejected"].includes(req.status);

          return (
            <Card key={req.id} className="p-4 border-border">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{req.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-muted-foreground">{categoryMap[req.category] || req.category}</span>
                    <span className={`font-medium ${pr.color}`}>
                      {req.priority === "urgent" && <AlertTriangle className="h-3 w-3 inline mr-0.5" />}
                      {pr.label}
                    </span>
                  </div>
                </div>
                <Badge className={`${st.color} text-[10px] border`}>
                  <StatusIcon className="h-3 w-3 mr-0.5" /> {st.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{req.description}</p>

              {isActive && (
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Select value={req.status} onValueChange={(val) => updateStatus(req.id, val)} disabled={updatingId === req.id}>
                      <SelectTrigger className="h-8 text-xs w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Terbuka</SelectItem>
                        <SelectItem value="in_progress">Dikerjakan</SelectItem>
                        <SelectItem value="resolved">Selesai</SelectItem>
                        <SelectItem value="rejected">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingId === req.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <Textarea
                    placeholder="Catatan penyelesaian..."
                    value={resolutionNotes[req.id] || ""}
                    onChange={e => setResolutionNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                    className="text-xs min-h-[60px]"
                  />
                </div>
              )}

              {req.resolution_notes && (
                <div className="bg-muted/50 rounded-md p-2 text-xs text-foreground mt-2">
                  <span className="font-medium">Catatan: </span>{req.resolution_notes}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                {new Date(req.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerMaintenanceManagement;
