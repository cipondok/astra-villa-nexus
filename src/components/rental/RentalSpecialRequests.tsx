import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface SpecialRequest {
  id: string;
  tenantName: string;
  propertyTitle: string;
  request: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  date: string;
  priority: 'low' | 'medium' | 'high';
}

interface RentalSpecialRequestsProps {
  requests: SpecialRequest[];
}

const RentalSpecialRequests = ({ requests }: RentalSpecialRequestsProps) => {
  const statusConfig = {
    pending: { icon: Clock, color: "bg-chart-3/10 text-chart-3 border-chart-3/20", label: "Pending" },
    approved: { icon: CheckCircle, color: "bg-chart-1/10 text-chart-1 border-chart-1/20", label: "Approved" },
    rejected: { icon: AlertCircle, color: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
    completed: { icon: CheckCircle, color: "bg-primary/10 text-primary border-primary/20", label: "Done" },
  };

  const priorityColor = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-chart-3/10 text-chart-3",
    high: "bg-destructive/10 text-destructive",
  };

  if (requests.length === 0) {
    return (
      <Card className="p-4 text-center">
        <MessageSquare className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/40" />
        <p className="text-[10px] font-medium text-foreground">Tidak ada permintaan khusus</p>
        <p className="text-[8px] text-muted-foreground">Permintaan dari penyewa akan muncul di sini.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-1">
      {requests.map(req => {
        const cfg = statusConfig[req.status];
        const StatusIcon = cfg.icon;
        return (
          <Card key={req.id} className="p-2">
            <div className="flex items-start justify-between gap-1 mb-0.5">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-medium text-foreground truncate">{req.tenantName}</p>
                <p className="text-[7px] text-muted-foreground truncate">{req.propertyTitle}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge className={`text-[7px] px-1 py-0 h-3.5 ${priorityColor[req.priority]}`}>{req.priority}</Badge>
                <Badge className={`text-[7px] px-1 py-0 h-3.5 gap-0.5 ${cfg.color}`}>
                  <StatusIcon className="h-2 w-2" /> {cfg.label}
                </Badge>
              </div>
            </div>
            <p className="text-[8px] text-muted-foreground leading-relaxed">{req.request}</p>
            <p className="text-[7px] text-muted-foreground/60 mt-0.5">
              {new Date(req.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

export default RentalSpecialRequests;
