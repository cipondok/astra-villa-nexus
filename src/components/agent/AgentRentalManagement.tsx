import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, CalendarDays, DollarSign, CheckCircle,
  Star, MessageSquare, BarChart3, AlertTriangle, Loader2
} from "lucide-react";
import RentalPropertyCard from "@/components/rental/RentalPropertyCard";
import RentalFinancialSummary from "@/components/rental/RentalFinancialSummary";
import RentalSpecialRequests from "@/components/rental/RentalSpecialRequests";
import { useAgentRentalData } from "@/hooks/useAgentRentalData";
import { getCurrencyFormatterShort } from "@/stores/currencyStore";

interface AgentRentalManagementProps {
  agentId?: string;
}

const AgentRentalManagement = ({ agentId }: AgentRentalManagementProps) => {
  const { rentals, specialRequests, isLoading, stats, financials } = useAgentRentalData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Home, label: "Rental Listings", value: `${rentals.length}`, color: "text-primary", bg: "bg-primary/10" },
          { icon: CheckCircle, label: "Active Rentals", value: `${stats.activeCount}`, color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: CalendarDays, label: "Upcoming", value: `${stats.upcomingCount}`, color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: DollarSign, label: "Revenue", value: getCurrencyFormatterShort()(stats.totalRevenue), color: "text-primary", bg: "bg-primary/10" },
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

      {/* Overdue Alert */}
      {stats.totalDues > 0 && (
        <Card className="p-2 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-destructive">Tunggakan Aktif</p>
              <p className="text-[8px] text-destructive/80">
                {getCurrencyFormatterShort()(stats.totalDues)} dari {rentals.filter(r => r.dueAmount > 0).length} properti
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="listings" className="space-y-2">
        <TabsList className="h-8 p-0.5 w-full grid grid-cols-3">
          <TabsTrigger value="listings" className="text-[8px] h-6 gap-0.5"><Home className="h-2.5 w-2.5" /> Properti</TabsTrigger>
          <TabsTrigger value="financials" className="text-[8px] h-6 gap-0.5"><DollarSign className="h-2.5 w-2.5" /> Keuangan</TabsTrigger>
          <TabsTrigger value="requests" className="text-[8px] h-6 gap-0.5"><MessageSquare className="h-2.5 w-2.5" /> Request</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-1.5">
          {rentals.length === 0 ? (
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
          ) : (
            rentals.map(rental => (
              <RentalPropertyCard key={rental.id} rental={rental} />
            ))
          )}
        </TabsContent>

        <TabsContent value="financials">
          <RentalFinancialSummary {...financials} />
          {rentals.length > 0 && (
            <Card className="mt-2 p-2">
              <h4 className="text-[10px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> Revenue per Properti
              </h4>
              <div className="space-y-1">
                {rentals.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-medium text-foreground truncate">{r.propertyTitle}</p>
                      <p className="text-[7px] text-muted-foreground">{r.tenantName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] font-bold text-foreground">{getCurrencyFormatterShort()(r.totalRevenue)}</p>
                      <p className="text-[7px] text-muted-foreground">
                        {r.dueAmount > 0 ? <span className="text-destructive">-{getCurrencyFormatterShort()(r.dueAmount)}</span> : <span className="text-chart-1">Lunas</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <RentalSpecialRequests requests={specialRequests} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentRentalManagement;
