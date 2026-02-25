import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, CalendarDays, DollarSign, Clock, CheckCircle,
  Users, TrendingUp, Star, MessageSquare, BarChart3, AlertTriangle
} from "lucide-react";
import RentalPropertyCard, { RentalDetail } from "@/components/rental/RentalPropertyCard";
import RentalFinancialSummary from "@/components/rental/RentalFinancialSummary";
import RentalReviewsRankings from "@/components/rental/RentalReviewsRankings";
import RentalSpecialRequests from "@/components/rental/RentalSpecialRequests";

interface AgentRentalManagementProps {
  agentId?: string;
}

// Demo data
const demoRentals: RentalDetail[] = [
  {
    id: "ar1",
    propertyTitle: "Villa Ocean Canggu",
    location: "Canggu, Bali",
    tenantName: "Sarah Johnson",
    status: "active",
    startDate: "2025-11-01",
    endDate: "2026-05-01",
    monthlyRent: 25000000,
    totalRent: 150000000,
    paidAmount: 100000000,
    dueAmount: 0,
    serviceCharges: 3500000,
    tax: 7500000,
    totalRevenue: 139000000,
    complianceScore: 98,
    rating: 4.9,
    thumbnailUrl: "",
  },
  {
    id: "ar2",
    propertyTitle: "Penthouse SCBD Tower",
    location: "SCBD, Jakarta",
    tenantName: "Michael Lee",
    status: "active",
    startDate: "2025-09-01",
    endDate: "2026-09-01",
    monthlyRent: 45000000,
    totalRent: 540000000,
    paidAmount: 270000000,
    dueAmount: 45000000,
    serviceCharges: 8000000,
    tax: 18000000,
    totalRevenue: 244000000,
    complianceScore: 65,
    rating: 3.8,
    feedback: "Response time perlu ditingkatkan",
    thumbnailUrl: "",
  },
  {
    id: "ar3",
    propertyTitle: "Townhouse BSD Green",
    location: "BSD City, Tangerang",
    tenantName: "Andi Prasetyo",
    status: "upcoming",
    startDate: "2026-04-15",
    endDate: "2027-04-15",
    monthlyRent: 12000000,
    totalRent: 144000000,
    paidAmount: 24000000,
    dueAmount: 0,
    serviceCharges: 1500000,
    tax: 4800000,
    totalRevenue: 0,
    complianceScore: 100,
    thumbnailUrl: "",
  },
];

const demoRequests = [
  { id: "asr1", tenantName: "Sarah Johnson", propertyTitle: "Villa Ocean Canggu", request: "Request late checkout for guest visit", status: "approved" as const, date: "2026-02-22", priority: "low" as const },
  { id: "asr2", tenantName: "Michael Lee", propertyTitle: "Penthouse SCBD", request: "Fixing water heater - urgent", status: "pending" as const, date: "2026-02-24", priority: "high" as const },
];

const demoReviews = [
  { id: "arv1", tenantName: "Sarah Johnson", propertyTitle: "Villa Ocean Canggu", rating: 5, comment: "Agent sangat profesional dan selalu cepat merespon. Proses sewa sangat lancar.", date: "2026-02-10" },
  { id: "arv2", tenantName: "Michael Lee", propertyTitle: "Penthouse SCBD", rating: 4, comment: "Properti sesuai deskripsi. Dokumen kontrak bisa lebih cepat disiapkan.", date: "2026-01-20" },
  { id: "arv3", tenantName: "Dewi Lestari", propertyTitle: "Villa Ubud Retreat", rating: 5, comment: "Excellent service dari awal sampai akhir.", date: "2025-12-15" },
];

const AgentRentalManagement = ({ agentId }: AgentRentalManagementProps) => {
  const activeCount = demoRentals.filter(r => r.status === 'active').length;
  const upcomingCount = demoRentals.filter(r => r.status === 'upcoming').length;
  const totalRevenue = demoRentals.reduce((s, r) => s + r.totalRevenue, 0);
  const totalDues = demoRentals.reduce((s, r) => s + r.dueAmount, 0);

  return (
    <div className="space-y-3">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Home, label: "Rental Listings", value: `${demoRentals.length}`, color: "text-primary", bg: "bg-primary/10" },
          { icon: CheckCircle, label: "Active Rentals", value: `${activeCount}`, color: "text-chart-1", bg: "bg-chart-1/10" },
          { icon: CalendarDays, label: "Upcoming", value: `${upcomingCount}`, color: "text-chart-3", bg: "bg-chart-3/10" },
          { icon: DollarSign, label: "Revenue", value: `Rp ${(totalRevenue / 1000000).toFixed(0)}Jt`, color: "text-primary", bg: "bg-primary/10" },
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
      {totalDues > 0 && (
        <Card className="p-2 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-destructive">Tunggakan Aktif</p>
              <p className="text-[8px] text-destructive/80">
                Rp {(totalDues / 1000000).toFixed(1)} Jt dari {demoRentals.filter(r => r.dueAmount > 0).length} properti
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="listings" className="space-y-2">
        <TabsList className="h-8 p-0.5 w-full grid grid-cols-4">
          <TabsTrigger value="listings" className="text-[8px] h-6 gap-0.5"><Home className="h-2.5 w-2.5" /> Properti</TabsTrigger>
          <TabsTrigger value="financials" className="text-[8px] h-6 gap-0.5"><DollarSign className="h-2.5 w-2.5" /> Keuangan</TabsTrigger>
          <TabsTrigger value="requests" className="text-[8px] h-6 gap-0.5"><MessageSquare className="h-2.5 w-2.5" /> Request</TabsTrigger>
          <TabsTrigger value="reviews" className="text-[8px] h-6 gap-0.5"><Star className="h-2.5 w-2.5" /> Ulasan</TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-1.5">
          {demoRentals.length === 0 ? (
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
            averageRating={4.6}
            totalReviews={demoReviews.length}
            ranking={8}
            totalLandlords={320}
            ratingBreakdown={[
              { stars: 5, count: 12 },
              { stars: 4, count: 5 },
              { stars: 3, count: 2 },
              { stars: 2, count: 0 },
              { stars: 1, count: 0 },
            ]}
            recentReviews={demoReviews}
            badges={["Top Agent", "Fast Response", "5-Star"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentRentalManagement;
