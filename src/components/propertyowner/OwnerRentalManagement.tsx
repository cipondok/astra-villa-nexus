import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, CalendarDays, DollarSign, CheckCircle, Clock, Users,
  BarChart3, TrendingUp, Star, MessageSquare, AlertTriangle
} from "lucide-react";
import RentalPropertyCard, { RentalDetail } from "@/components/rental/RentalPropertyCard";
import RentalFinancialSummary from "@/components/rental/RentalFinancialSummary";
import RentalReviewsRankings from "@/components/rental/RentalReviewsRankings";
import RentalSpecialRequests from "@/components/rental/RentalSpecialRequests";

// Demo data — will be replaced with live queries
const demoRentals: RentalDetail[] = [
  {
    id: "r1",
    propertyTitle: "Villa Sunset Seminyak",
    location: "Seminyak, Bali",
    tenantName: "Budi Santoso",
    status: "active",
    startDate: "2025-12-01",
    endDate: "2026-06-01",
    monthlyRent: 15000000,
    totalRent: 90000000,
    paidAmount: 45000000,
    dueAmount: 0,
    serviceCharges: 2500000,
    tax: 4500000,
    totalRevenue: 83000000,
    complianceScore: 95,
    rating: 4.8,
    specialRequests: "Extra parking spot",
    thumbnailUrl: "",
  },
  {
    id: "r2",
    propertyTitle: "Apartemen Sudirman Park",
    location: "Jakarta Pusat",
    tenantName: "Rina Wijaya",
    status: "upcoming",
    startDate: "2026-04-01",
    endDate: "2027-04-01",
    monthlyRent: 8000000,
    totalRent: 96000000,
    paidAmount: 16000000,
    dueAmount: 0,
    serviceCharges: 1200000,
    tax: 3200000,
    totalRevenue: 0,
    complianceScore: 100,
    thumbnailUrl: "",
  },
  {
    id: "r3",
    propertyTitle: "Rumah Menteng Heritage",
    location: "Menteng, Jakarta",
    tenantName: "David Chen",
    status: "active",
    startDate: "2025-06-15",
    endDate: "2026-06-15",
    monthlyRent: 35000000,
    totalRent: 420000000,
    paidAmount: 280000000,
    dueAmount: 35000000,
    serviceCharges: 5000000,
    tax: 14000000,
    totalRevenue: 261000000,
    complianceScore: 72,
    rating: 4.2,
    feedback: "Maintenance bisa lebih cepat",
    thumbnailUrl: "",
  },
];

const demoRequests = [
  { id: "sr1", tenantName: "Budi Santoso", propertyTitle: "Villa Sunset Seminyak", request: "Tambah tempat parkir motor di garasi", status: "pending" as const, date: "2026-02-20", priority: "medium" as const },
  { id: "sr2", tenantName: "David Chen", propertyTitle: "Rumah Menteng Heritage", request: "Perbaiki AC di kamar utama", status: "approved" as const, date: "2026-02-18", priority: "high" as const },
  { id: "sr3", tenantName: "Rina Wijaya", propertyTitle: "Apartemen Sudirman Park", request: "Izin pasang internet tambahan", status: "completed" as const, date: "2026-02-10", priority: "low" as const },
];

const demoReviews = [
  { id: "rv1", tenantName: "Budi Santoso", propertyTitle: "Villa Sunset Seminyak", rating: 5, comment: "Pemilik sangat responsif dan properti terawat dengan baik. Sangat merekomendasikan!", date: "2026-02-15" },
  { id: "rv2", tenantName: "David Chen", propertyTitle: "Rumah Menteng Heritage", rating: 4, comment: "Lokasi sangat strategis. Maintenance response bisa ditingkatkan.", date: "2026-01-28" },
];

const OwnerRentalManagement = () => {
  const activeCount = demoRentals.filter(r => r.status === 'active').length;
  const upcomingCount = demoRentals.filter(r => r.status === 'upcoming').length;
  const totalRevenue = demoRentals.reduce((s, r) => s + r.totalRevenue, 0);
  const totalDues = demoRentals.reduce((s, r) => s + r.dueAmount, 0);

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {[
          { icon: Home, label: "Total Rental", value: `${demoRentals.length}`, color: "text-primary", bg: "bg-primary/10" },
          { icon: CheckCircle, label: "Aktif", value: `${activeCount}`, color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: CalendarDays, label: "Upcoming", value: `${upcomingCount}`, color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: DollarSign, label: "Revenue", value: `Rp ${(totalRevenue / 1000000).toFixed(0)}Jt`, color: "text-primary", bg: "bg-primary/10" },
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
      {totalDues > 0 && (
        <Card className="p-2 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-destructive">Tunggakan Aktif</p>
              <p className="text-[8px] text-destructive/80">
                Total Rp {(totalDues / 1000000).toFixed(1)} Jt dari {demoRentals.filter(r => r.dueAmount > 0).length} properti
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

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-1.5">
          {demoRentals.length === 0 ? (
            <Card className="p-4 text-center">
              <Home className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-medium">Belum ada properti rental</p>
              <p className="text-[9px] text-muted-foreground">Properti rental Anda akan muncul di sini.</p>
            </Card>
          ) : (
            demoRentals.map(rental => (
              <RentalPropertyCard key={rental.id} rental={rental} />
            ))
          )}
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <RentalFinancialSummary
            totalRentCollected={demoRentals.reduce((s, r) => s + r.paidAmount, 0)}
            totalServiceCharges={demoRentals.reduce((s, r) => s + r.serviceCharges, 0)}
            totalTax={demoRentals.reduce((s, r) => s + r.tax, 0)}
            totalDues={totalDues}
            totalRevenue={totalRevenue}
            occupancyRate={Math.round((activeCount / Math.max(demoRentals.length, 1)) * 100)}
          />

          {/* Per-property revenue table */}
          <Card className="mt-2 p-2">
            <h4 className="text-[10px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Revenue per Properti
            </h4>
            <div className="space-y-1">
              {demoRentals.map(r => (
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
        </TabsContent>

        {/* Special Requests Tab */}
        <TabsContent value="requests">
          <RentalSpecialRequests requests={demoRequests} />
        </TabsContent>

        {/* Reviews & Rankings Tab */}
        <TabsContent value="reviews">
          <RentalReviewsRankings
            averageRating={4.5}
            totalReviews={demoReviews.length}
            ranking={12}
            totalLandlords={245}
            ratingBreakdown={[
              { stars: 5, count: 8 },
              { stars: 4, count: 4 },
              { stars: 3, count: 1 },
              { stars: 2, count: 0 },
              { stars: 1, count: 0 },
            ]}
            recentReviews={demoReviews}
            badges={["Responsif", "Top 5%", "Terpercaya"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerRentalManagement;
