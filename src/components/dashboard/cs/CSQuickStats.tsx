import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, MessageSquare, Clock } from "lucide-react";

interface CSQuickStatsProps {
  myOpenTickets: number;
  myResolvedToday: number;
  pendingInquiries: number;
  availableTickets: number;
}

const CSQuickStats = ({ 
  myOpenTickets, 
  myResolvedToday, 
  pendingInquiries, 
  availableTickets 
}: CSQuickStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-chart-3/30 bg-gradient-to-br from-chart-3/10 to-background">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">My Open Tickets</p>
              <p className="text-lg font-bold text-chart-3">{myOpenTickets}</p>
            </div>
            <div className="w-8 h-8 bg-chart-3/20 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-chart-1/30 bg-gradient-to-br from-chart-1/10 to-background">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Resolved Today</p>
              <p className="text-lg font-bold text-chart-1">{myResolvedToday}</p>
            </div>
            <div className="w-8 h-8 bg-chart-1/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-chart-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-chart-4/30 bg-gradient-to-br from-chart-4/10 to-background">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Pending Inquiries</p>
              <p className="text-lg font-bold text-chart-4">{pendingInquiries}</p>
            </div>
            <div className="w-8 h-8 bg-chart-4/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-chart-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-chart-5/30 bg-gradient-to-br from-chart-5/10 to-background">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Available Tickets</p>
              <p className="text-lg font-bold text-chart-5">{availableTickets}</p>
            </div>
            <div className="w-8 h-8 bg-chart-5/20 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-chart-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSQuickStats;
