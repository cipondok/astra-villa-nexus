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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">My Open Tickets</p>
              <p className="text-2xl font-bold text-orange-600">{myOpenTickets}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{myResolvedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Inquiries</p>
              <p className="text-2xl font-bold text-blue-600">{pendingInquiries}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Tickets</p>
              <p className="text-2xl font-bold text-purple-600">{availableTickets}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSQuickStats;