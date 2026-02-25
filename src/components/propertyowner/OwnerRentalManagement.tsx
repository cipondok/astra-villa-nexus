import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, CalendarDays, DollarSign, CheckCircle, Clock, Users,
  BarChart3, MapPin, TrendingUp, XCircle
} from "lucide-react";

const OwnerRentalManagement = () => {
  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {[
          { icon: Home, label: "Rental Properties", value: "0", color: "text-primary", bg: "bg-primary/10" },
          { icon: CalendarDays, label: "Booking Requests", value: "0", color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: CheckCircle, label: "Active Rentals", value: "0", color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: DollarSign, label: "Income", value: "Rp 0", color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <Card key={i} className="p-1.5">
            <div className="flex items-center gap-1.5">
              <div className={`h-6 w-6 rounded flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold block leading-none">{stat.value}</span>
                <span className="text-[8px] text-muted-foreground">{stat.label}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bookings" className="space-y-2">
        <TabsList className="h-7 p-0.5 w-full grid grid-cols-3">
          <TabsTrigger value="bookings" className="text-[9px] h-5 gap-1"><CalendarDays className="h-3 w-3" /> Bookings</TabsTrigger>
          <TabsTrigger value="availability" className="text-[9px] h-5 gap-1"><Clock className="h-3 w-3" /> Availability</TabsTrigger>
          <TabsTrigger value="income" className="text-[9px] h-5 gap-1"><DollarSign className="h-3 w-3" /> Income</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card className="p-4">
            <div className="text-center py-3">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-medium">No booking requests</p>
              <p className="text-[9px] text-muted-foreground">
                Booking requests for your rental properties will appear here.
              </p>
            </div>
          </Card>

          {/* Example booking */}
          <Card className="mt-2 p-2 border-border opacity-60">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-medium truncate">Villa Contoh</h4>
                  <Badge className="text-[7px] px-1 py-0 h-3 bg-chart-3/10 text-chart-3 border-chart-3/20">Pending</Badge>
                </div>
                <p className="text-[8px] text-muted-foreground">Check-in: 15 Mar • 3 nights • Rp 4.5Jt</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" className="h-5 text-[8px] px-1.5"><CheckCircle className="h-2.5 w-2.5" /></Button>
                <Button size="sm" variant="outline" className="h-5 text-[8px] px-1.5"><XCircle className="h-2.5 w-2.5" /></Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="p-4">
            <div className="text-center py-3">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-medium">Availability Calendar</p>
              <p className="text-[9px] text-muted-foreground">
                Set availability dates for your rental properties. Coming soon.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card className="p-4">
            <div className="text-center py-3">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-medium">Rental Income Tracking</p>
              <p className="text-[9px] text-muted-foreground">
                Income from your rental properties will be tracked here.
              </p>
            </div>
          </Card>

          {/* Income summary placeholder */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {[
              { label: "This Month", value: "Rp 0", trend: "+0%" },
              { label: "Total Income", value: "Rp 0", trend: "" },
            ].map((item, i) => (
              <Card key={i} className="p-2">
                <p className="text-[8px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold text-foreground">{item.value}</p>
                {item.trend && <p className="text-[8px] text-chart-1">{item.trend}</p>}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerRentalManagement;
