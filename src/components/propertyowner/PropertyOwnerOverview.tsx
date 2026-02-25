import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyOwnerData } from "@/hooks/usePropertyOwnerData";
import OwnerRentalManagement from "./OwnerRentalManagement";
import OwnerMaintenanceManagement from "./OwnerMaintenanceManagement";
import OwnerRentalAnalytics from "./OwnerRentalAnalytics";
import OwnerLeaseRenewal from "./OwnerLeaseRenewal";
import OwnerVerificationReview from "./OwnerVerificationReview";
import OwnerInvoiceManagement from "./OwnerInvoiceManagement";
import { formatDistanceToNow } from "date-fns";
import { formatIDR } from "@/utils/currency";
import { 
  Building, Eye, Heart, MessageSquare, PlusCircle, Activity, Target, Home,
  TrendingUp, Clock, ChevronRight, Settings, ArrowLeft, Search, CalendarDays,
  User, Shield, Copy, BarChart3, MapPin, Zap, FileText, Bell, 
  DollarSign, Star, Percent, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const PropertyOwnerOverview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const { profile, user } = useAuth();
  const { properties, stats, recentActivity, isLoading } = usePropertyOwnerData();

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("Owner ID disalin!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Derived analytics
  const activeRate = stats.totalProperties > 0 
    ? Math.round((stats.activeListings / stats.totalProperties) * 100) : 0;
  const conversionRate = stats.totalViews > 0 
    ? ((stats.totalInquiries / stats.totalViews) * 100).toFixed(1) : '0';

  const smartLinks = [
    { icon: PlusCircle, label: 'Tambah Properti', desc: 'List baru', color: 'text-primary', bg: 'bg-primary/10', action: () => navigate('/add-property') },
    { icon: Home, label: 'Properti Saya', desc: `${stats.totalProperties} listing`, color: 'text-chart-1', bg: 'bg-chart-1/10', action: () => navigate('/my-properties') },
    { icon: Search, label: 'Jelajahi Pasar', desc: 'Beli & Sewa', color: 'text-accent-foreground', bg: 'bg-accent/50', action: () => navigate('/dijual') },
    { icon: CalendarDays, label: 'Kelola Rental', desc: 'Booking & tenant', color: 'text-chart-3', bg: 'bg-chart-3/10', action: () => navigate('/dashboard/property-owner?tab=rentals') },
    { icon: FileText, label: 'Dokumen', desc: 'Kontrak & legal', color: 'text-chart-5', bg: 'bg-chart-5/10', action: () => navigate('/dashboard/property-owner?tab=activity') },
    { icon: Settings, label: 'Pengaturan', desc: 'Profil & akun', color: 'text-muted-foreground', bg: 'bg-muted', action: () => navigate('/settings') },
  ];

  return (
    <div className="space-y-2.5">
      {/* Profile Card with ID */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="h-10 w-10 bg-primary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-primary-foreground/30">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-primary-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-primary-foreground truncate">
                  {profile?.full_name || 'Property Owner'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="text-[7px] px-1 py-0 h-3.5 bg-primary-foreground/20 text-primary-foreground border-0 gap-0.5">
                    <Shield className="h-2 w-2" /> Verified Owner
                  </Badge>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 bg-chart-1 rounded-full animate-pulse"></div>
                    <span className="text-[7px] text-primary-foreground/70">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => navigate('/dashboard/user')}>
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" className="h-7 px-2.5 text-[9px] bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground" onClick={() => navigate('/add-property')}>
                <PlusCircle className="h-3 w-3 mr-1" /> Tambah
              </Button>
            </div>
          </div>
        </div>
        {/* Owner ID Row */}
        <div className="px-3 py-1.5 bg-muted/30 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[8px] text-muted-foreground">Owner ID:</span>
            <code className="text-[8px] font-mono text-foreground bg-muted px-1 py-0.5 rounded truncate max-w-[140px]">
              {user?.id?.slice(0, 8)}...{user?.id?.slice(-4)}
            </code>
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={copyId}>
              <Copy className="h-2.5 w-2.5 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-muted-foreground">Bergabung:</span>
            <span className="text-[8px] text-foreground font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
            </span>
          </div>
        </div>
      </Card>

      {/* Analytics Overview - Always Visible */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { icon: Building, value: stats.totalProperties, label: 'Total', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Activity, value: stats.activeListings, label: 'Aktif', color: 'text-chart-1', bg: 'bg-chart-1/10' },
          { icon: Target, value: stats.pendingApprovals, label: 'Pending', color: 'text-chart-3', bg: 'bg-chart-3/10' },
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

      {/* Key Performance Metrics */}
      <Card className="p-2">
        <div className="flex items-center gap-1 mb-1.5">
          <BarChart3 className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold text-foreground">Performa Ringkas</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-muted/40 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-muted-foreground">Tingkat Aktif</span>
              <span className="text-[9px] font-bold text-chart-1">{activeRate}%</span>
            </div>
            <Progress value={activeRate} className="h-1" />
          </div>
          <div className="bg-muted/40 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-muted-foreground">Konversi</span>
              <span className="text-[9px] font-bold text-primary">{conversionRate}%</span>
            </div>
            <Progress value={Number(conversionRate)} className="h-1" />
          </div>
          <div className="bg-muted/40 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Eye className="h-2.5 w-2.5 text-chart-5" />
              <span className="text-[8px] text-muted-foreground">Views</span>
            </div>
            <span className="text-[10px] font-bold text-foreground">{stats.totalViews}</span>
          </div>
          <div className="bg-muted/40 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Heart className="h-2.5 w-2.5 text-destructive" />
              <span className="text-[8px] text-muted-foreground">Disimpan</span>
            </div>
            <span className="text-[10px] font-bold text-foreground">{stats.savedCount}</span>
          </div>
        </div>
      </Card>

      {/* Smart Navigation Links */}
      <div>
        <div className="flex items-center gap-1 mb-1.5 px-0.5">
          <Zap className="h-3 w-3 text-chart-3" />
          <span className="text-[10px] font-semibold text-foreground">Aksi Cepat</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {smartLinks.map((link, i) => (
            <Card
              key={i}
              className="p-2 cursor-pointer hover:shadow-md active:scale-[0.97] transition-all"
              onClick={link.action}
            >
              <div className="flex flex-col items-center text-center gap-1">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${link.bg}`}>
                  <link.icon className={`h-4 w-4 ${link.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-foreground leading-tight">{link.label}</p>
                  <p className="text-[7px] text-muted-foreground leading-tight">{link.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-2">
        <TabsList className="flex w-full overflow-x-auto h-7 p-0.5">
          <TabsTrigger value="overview" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <BarChart3 className="h-2.5 w-2.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="rentals" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <CalendarDays className="h-2.5 w-2.5" /> Rentals
          </TabsTrigger>
          <TabsTrigger value="renewal" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <Clock className="h-2.5 w-2.5" /> Renewal
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <Shield className="h-2.5 w-2.5" /> KYC
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <DollarSign className="h-2.5 w-2.5" /> Invoice
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <Settings className="h-2.5 w-2.5" /> Maint.
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <Activity className="h-2.5 w-2.5" /> Activity
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-[7px] h-5 gap-0.5 min-w-fit">
            <TrendingUp className="h-2.5 w-2.5" /> Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab — Properties List */}
        <TabsContent value="overview" className="space-y-1.5 mt-1.5">
          <div className="flex items-center justify-between px-0.5 mb-1">
            <span className="text-[10px] font-semibold text-foreground">Daftar Properti</span>
            <Button variant="link" size="sm" className="h-4 text-[8px] px-0 text-primary" onClick={() => navigate('/my-properties')}>
              Lihat Semua <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
            </Button>
          </div>
          {properties.length === 0 ? (
            <Card className="p-3">
              <div className="text-center py-4">
                <Building className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs font-medium">Belum ada properti</p>
                <p className="text-[9px] text-muted-foreground mb-2">Tambahkan properti pertama Anda</p>
                <Button size="sm" className="h-6 text-[9px]" onClick={() => navigate('/add-property')}>
                  <PlusCircle className="h-3 w-3 mr-1" /> Tambah Properti
                </Button>
              </div>
            </Card>
          ) : (
            properties.slice(0, 5).map((property) => (
              <Card 
                key={property.id} 
                className="p-1.5 active:scale-[0.99] transition-transform cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <div className="flex gap-2">
                  <div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                    {property.thumbnail_url || property.images?.[0] ? (
                      <img src={property.thumbnail_url || property.images?.[0]} alt={property.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><Building className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-[10px] font-medium truncate flex-1 leading-tight">{property.title || 'Untitled'}</h3>
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-[7px] px-1 py-0 h-3 flex-shrink-0">{property.status}</Badge>
                    </div>
                    <p className="text-[8px] text-muted-foreground truncate leading-tight">{property.city}, {property.state}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] font-semibold text-primary">{formatIDR(property.price)}</span>
                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">{property.listing_type}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground self-center flex-shrink-0" />
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Rentals Tab */}
        <TabsContent value="rentals" className="mt-1.5">
          <OwnerRentalManagement />
        </TabsContent>

        {/* Renewal Tab */}
        <TabsContent value="renewal" className="mt-1.5">
          <OwnerLeaseRenewal />
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="mt-1.5">
          <OwnerVerificationReview />
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-1.5">
          <OwnerInvoiceManagement />
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="mt-1.5">
          <OwnerMaintenanceManagement />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-1.5 mt-1.5">
          {recentActivity.length === 0 ? (
            <Card className="p-3">
              <div className="text-center py-4">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs font-medium">Belum ada aktivitas</p>
                <p className="text-[9px] text-muted-foreground">Aktivitas Anda akan muncul di sini</p>
              </div>
            </Card>
          ) : (
            recentActivity.map((activity: any) => (
              <Card key={activity.id} className="p-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium truncate leading-tight">{activity.activity_type?.replace(/_/g, ' ')}</p>
                    <p className="text-[8px] text-muted-foreground truncate leading-tight">{activity.activity_description}</p>
                  </div>
                  <span className="text-[7px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-1.5 mt-1.5">
          <OwnerRentalAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyOwnerOverview;
