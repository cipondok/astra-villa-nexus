import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wrench, Clock, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

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
  plumbing: "Pipa & Air",
  electrical: "Listrik",
  ac_heating: "AC / Pendingin",
  appliance: "Peralatan",
  structural: "Struktur Bangunan",
  pest: "Hama",
  cleaning: "Kebersihan",
  general: "Umum",
};

interface Props {
  requests: MaintenanceRequest[];
  isLoading: boolean;
}

const MaintenanceRequestList = ({ requests, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-8 border-border">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Tidak Ada Permintaan</h3>
          <p className="text-sm text-muted-foreground">Permintaan perbaikan Anda akan muncul di sini.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map(req => {
        const st = statusMap[req.status] || statusMap.open;
        const pr = priorityMap[req.priority] || priorityMap.medium;
        const StatusIcon = st.icon;

        return (
          <Card key={req.id} className="p-4 border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground line-clamp-1">{req.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-muted-foreground">{categoryMap[req.category] || req.category}</span>
                  <span className={`font-medium ${pr.color}`}>{pr.label}</span>
                </div>
              </div>
              <Badge className={`${st.color} text-[10px] border flex-shrink-0`}>
                <StatusIcon className="h-3 w-3 mr-0.5" /> {st.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{req.description}</p>
            {req.resolution_notes && (
              <div className="bg-muted/50 rounded-md p-2 text-xs text-foreground">
                <span className="font-medium">Catatan: </span>{req.resolution_notes}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">
              {new Date(req.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              {req.resolved_at && ` • Selesai ${new Date(req.resolved_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

export default MaintenanceRequestList;
