import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, CalendarDays, DollarSign, CheckCircle, Clock,
  BarChart3, Star, MessageSquare, AlertTriangle, Loader2
} from "lucide-react";
import RentalPropertyCard from "@/components/rental/RentalPropertyCard";
import RentalFinancialSummary from "@/components/rental/RentalFinancialSummary";
import RentalReviewsRankings from "@/components/rental/RentalReviewsRankings";
import RentalSpecialRequests from "@/components/rental/RentalSpecialRequests";
import { useOwnerRentalData } from "@/hooks/useOwnerRentalData";

const OwnerRentalManagement = () => {
  const {
    rentals, specialRequests, recentReviews, isLoading,
    stats, financials, reviewStats
  } = useOwnerRentalData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {[
          { icon: Home, label: "Total Rental", value: `${rentals.length}`, color: "text-primary", bg: "bg-primary/10" },
          { icon: CheckCircle, label: "Aktif", value: `${stats.activeCount}`, color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: CalendarDays, label: "Upcoming", value: `${stats.upcomingCount}`, color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: DollarSign, label: "Revenue", value: `Rp ${(stats.totalRevenue / 1000000).toFixed(0)}Jt`, color: "text-primary", bg: "bg-primary/10" },
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

      {/* Overdue Alert */}
      {stats.totalDues > 0 && (
        <Card className="p-2 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-destructive">Tunggakan Aktif</p>
              <p className="text-[8px] text-destructive/80">
                Total Rp {(stats.totalDues / 1000000).toFixed(1)} Jt dari {rentals.filter(r => r.dueAmount > 0).length} properti
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="properties" className="space-y-2">
        <TabsList className="h-7 p-0.5 w-full grid grid-cols-4">
          <TabsTrigger value="properties" className="text-[8px] h-5 gap-0.5"><Home className="h-2.5 w-2.5" /> Properti</TabsTrigger>
          <TabsTrigger value="financials" className="text-[8px] h-5 gap-0.5"><DollarSign className="h-2.5 w-2.5" /> Keuangan</TabsTrigger>
          <TabsTrigger value="requests" className="text-[8px] h-5 gap-0.5"><MessageSquare className="h-2.5 w-2.5" /> Request</TabsTrigger>
          <TabsTrigger value="reviews" className="text-[8px] h-5 gap-0.5"><Star className="h-2.5 w-2.5" /> Ulasan</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-1.5">
          {rentals.length === 0 ? (
            <Card className="p-4 text-center">
              <Home className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-medium">Belum ada properti rental</p>
              <p className="text-[9px] text-muted-foreground">Properti rental Anda akan muncul di sini.</p>
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
                      <p className="text-[9px] font-bold text-foreground">Rp {(r.totalRevenue / 1000000).toFixed(1)}Jt</p>
                      <p className="text-[7px] text-muted-foreground">
                        {r.dueAmount > 0 ? <span className="text-destructive">-Rp {(r.dueAmount / 1000000).toFixed(1)}Jt</span> : <span className="text-chart-1">Lunas</span>}
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

        <TabsContent value="reviews">
          <RentalReviewsRankings
            averageRating={reviewStats.averageRating}
            totalReviews={reviewStats.totalReviews}
            ranking={0}
            totalLandlords={0}
            ratingBreakdown={reviewStats.ratingBreakdown}
            recentReviews={recentReviews}
            badges={[]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerRentalManagement;
