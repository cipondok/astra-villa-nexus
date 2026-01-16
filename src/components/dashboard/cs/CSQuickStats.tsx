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
      <Card className="border-orange-200/50 dark:border-orange-800/30 bg-gradient-to-br from-orange-50/50 to-background dark:from-orange-950/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">My Open Tickets</p>
              <p className="text-lg font-bold text-orange-600">{myOpenTickets}</p>
            </div>
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200/50 dark:border-green-800/30 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Resolved Today</p>
              <p className="text-lg font-bold text-green-600">{myResolvedToday}</p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Pending Inquiries</p>
              <p className="text-lg font-bold text-blue-600">{pendingInquiries}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Available Tickets</p>
              <p className="text-lg font-bold text-purple-600">{availableTickets}</p>
            </div>
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSQuickStats;
