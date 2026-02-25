import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Home, Clock, CalendarDays, MapPin, Users, Star,
  TrendingUp, AlertCircle, CheckCircle, MessageSquare, FileText
} from "lucide-react";
import { formatIDR } from "@/utils/currency";
import RentalChatDialog from "./RentalChatDialog";
import RentalDocumentsDialog from "./RentalDocumentsDialog";

export interface RentalDetail {
  id: string;
  propertyTitle: string;
  location: string;
  tenantName: string;
  tenantAvatar?: string;
  status: 'active' | 'upcoming' | 'completed' | 'overdue';
  startDate: string;
  endDate: string;
  monthlyRent: number;
  totalRent: number;
  paidAmount: number;
  dueAmount: number;
  serviceCharges: number;
  tax: number;
  totalRevenue: number;
  specialRequests?: string;
  complianceScore: number;
  rating?: number;
  feedback?: string;
  thumbnailUrl?: string;
}

interface RentalPropertyCardProps {
  rental: RentalDetail;
  onClick?: (id: string) => void;
}

const RentalPropertyCard = ({ rental, onClick }: RentalPropertyCardProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const now = new Date();
  const start = new Date(rental.startDate);
  const end = new Date(rental.endDate);
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  const paymentPercent = rental.totalRent > 0 ? Math.round((rental.paidAmount / rental.totalRent) * 100) : 0;

  const statusConfig = {
    active: { label: "Aktif", color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
    upcoming: { label: "Upcoming", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
    completed: { label: "Selesai", color: "bg-primary/10 text-primary border-primary/20" },
    overdue: { label: "Overdue", color: "bg-destructive/10 text-destructive border-destructive/20" },
  };

  const cfg = statusConfig[rental.status];

  return (
    <Card
      className="p-2.5 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
      onClick={() => onClick?.(rental.id)}
    >
      {/* Header Row */}
      <div className="flex gap-2.5 mb-2">
        <div className="h-14 w-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
          {rental.thumbnailUrl ? (
            <img src={rental.thumbnailUrl} alt={rental.propertyTitle} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-[11px] font-semibold truncate leading-tight">{rental.propertyTitle}</h4>
            <Badge className={`text-[7px] px-1 py-0 h-3.5 flex-shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
          </div>
          <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <MapPin className="h-2.5 w-2.5" /> {rental.location}
          </p>
          <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <Users className="h-2.5 w-2.5" /> {rental.tenantName}
          </p>
        </div>
      </div>

      {/* Rental Period Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {rental.status === 'active' ? `${remainingDays} hari tersisa` : rental.status === 'upcoming' ? `Mulai dalam ${remainingDays} hari` : 'Selesai'}
          </span>
          <span className="text-[8px] font-medium text-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} multiColor className="h-1.5" />
        <div className="flex justify-between mt-0.5">
          <span className="text-[7px] text-muted-foreground">{new Date(rental.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
          <span className="text-[7px] text-muted-foreground">{new Date(rental.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        <div className="bg-muted/30 rounded p-1.5 text-center">
          <p className="text-[7px] text-muted-foreground">Rent/bln</p>
          <p className="text-[9px] font-bold text-foreground">{formatIDR(rental.monthlyRent)}</p>
        </div>
        <div className="bg-chart-1/5 rounded p-1.5 text-center">
          <p className="text-[7px] text-muted-foreground">Dibayar</p>
          <p className="text-[9px] font-bold text-chart-1">{formatIDR(rental.paidAmount)}</p>
        </div>
        <div className={`rounded p-1.5 text-center ${rental.dueAmount > 0 ? 'bg-destructive/5' : 'bg-muted/30'}`}>
          <p className="text-[7px] text-muted-foreground">Tunggakan</p>
          <p className={`text-[9px] font-bold ${rental.dueAmount > 0 ? 'text-destructive' : 'text-foreground'}`}>{formatIDR(rental.dueAmount)}</p>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[8px] text-muted-foreground">Pembayaran</span>
          <span className="text-[8px] font-medium text-foreground">{paymentPercent}%</span>
        </div>
        <Progress value={paymentPercent} className="h-1" />
      </div>

      {/* Bottom row: compliance + rating + chat */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-1">
          <CheckCircle className={`h-2.5 w-2.5 ${rental.complianceScore >= 80 ? 'text-chart-1' : rental.complianceScore >= 50 ? 'text-chart-3' : 'text-destructive'}`} />
          <span className="text-[8px] text-muted-foreground">Compliance: {rental.complianceScore}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          {rental.rating && (
            <div className="flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 text-chart-3 fill-chart-3" />
              <span className="text-[8px] font-medium text-foreground">{rental.rating.toFixed(1)}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={(e) => { e.stopPropagation(); setDocsOpen(true); }}
          >
            <FileText className="h-3 w-3 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={(e) => { e.stopPropagation(); setChatOpen(true); }}
          >
            <MessageSquare className="h-3 w-3 text-primary" />
          </Button>
        </div>
      </div>

      <RentalChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        bookingId={rental.id}
        propertyTitle={rental.propertyTitle}
      />
      <RentalDocumentsDialog
        open={docsOpen}
        onOpenChange={setDocsOpen}
        bookingId={rental.id}
        propertyTitle={rental.propertyTitle}
      />
    </Card>
  );
};

export default RentalPropertyCard;
