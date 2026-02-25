import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, CalendarDays, DollarSign, Clock, CheckCircle, XCircle, 
  AlertCircle, Users, TrendingUp, MapPin, Eye, BarChart3
} from "lucide-react";

interface AgentRentalManagementProps {
  agentId?: string;
}

const AgentRentalManagement = ({ agentId }: AgentRentalManagementProps) => {
  return (
    <div className="space-y-3">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Home, label: "Rental Listings", value: "0", color: "text-primary", bg: "bg-primary/10" },
          { icon: CalendarDays, label: "Pending Bookings", value: "0", color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: CheckCircle, label: "Active Rentals", value: "0", color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: DollarSign, label: "Revenue", value: "Rp 0", color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <Card key={i} className="p-2">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold">{stat.value}</p>
                <p className="text-[8px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="listings" className="space-y-2">
        <TabsList className="h-8 p-0.5 w-full grid grid-cols-3">
          <TabsTrigger value="listings" className="text-[9px] h-6 gap-1"><Home className="h-3 w-3" /> Listings</TabsTrigger>
          <TabsTrigger value="requests" className="text-[9px] h-6 gap-1"><CalendarDays className="h-3 w-3" /> Requests</TabsTrigger>
          <TabsTrigger value="calendar" className="text-[9px] h-6 gap-1"><BarChart3 className="h-3 w-3" /> Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <Card className="p-6 border-border">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Rental Listings</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Properti rental yang Anda kelola akan muncul di sini.
              </p>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => window.location.href = '/add-property'}>
                Tambah Properti Rental
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="p-6 border-border">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-chart-3/10 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Booking Requests</h3>
              <p className="text-xs text-muted-foreground">
                Permintaan booking dari calon penyewa akan muncul di sini.
              </p>
            </div>
          </Card>

          {/* Example pending request */}
          <Card className="mt-2 p-3 border-border opacity-60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-medium text-foreground">Booking Request #001</h4>
                  <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20 text-[9px]">
                    <Clock className="h-2.5 w-2.5 mr-0.5" /> Pending
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Villa Contoh — 3 malam — Rp 4.5 Jt</p>
                <div className="flex gap-1.5 mt-2">
                  <Button size="sm" className="h-6 text-[9px] px-2">Approve</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[9px] px-2">Reject</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-6 border-border">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-chart-1/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Rental Calendar</h3>
              <p className="text-xs text-muted-foreground">
                Kalender okupansi akan tersedia setelah Anda memiliki properti rental aktif.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentRentalManagement;
