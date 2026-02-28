import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import OwnerInspectionManagement from "./OwnerInspectionManagement";
import OwnerTenantScreening from "./OwnerTenantScreening";
import OwnerDepositManagement from "./OwnerDepositManagement";
import OwnerLeaseContracts from "./OwnerLeaseContracts";
import OwnerPaymentAutomation from "./OwnerPaymentAutomation";
import OwnerAnnouncementHub from "./OwnerAnnouncementHub";
import OwnerExpenseTracking from "./OwnerExpenseTracking";
import OwnerPayoutManagement from "./OwnerPayoutManagement";
import OwnerSmartPricing from "./OwnerSmartPricing";
import OwnerBookingCancellation from "./OwnerBookingCancellation";
import OwnerPropertyAnalytics from "./OwnerPropertyAnalytics";
import OwnerConversionTracking from "./OwnerConversionTracking";
import LeadScoringPanel from "@/components/agent-analytics/LeadScoringPanel";
import ListingTipsPanel from "@/components/agent-analytics/ListingTipsPanel";
import OwnerCheckInOut from "./OwnerCheckInOut";
import OwnerAstraTokenCard from "./OwnerAstraTokenCard";
import OwnerVisitorTracking from "./OwnerVisitorTracking";
import OwnerFinancialAnalytics from "./OwnerFinancialAnalytics";
import OwnerCalendarView from "./OwnerCalendarView";
import OwnerReviewsDashboard from "./OwnerReviewsDashboard";
import RentalNotificationCenter from "@/components/rental/RentalNotificationCenter";
import OwnerReminderDashboard from "./OwnerReminderDashboard";
import OwnerOccupancyForecast from "./OwnerOccupancyForecast";
import OwnerTenantDocuments from "./OwnerTenantDocuments";
import { formatDistanceToNow } from "date-fns";
import { formatIDR } from "@/utils/currency";
import { 
  Building, Eye, Heart, MessageSquare, PlusCircle, Activity, Target, Home,
  TrendingUp, Clock, ChevronRight, ChevronDown, Settings, ArrowLeft, Search, CalendarDays,
  User, Shield, Copy, BarChart3, MapPin, Zap, FileText, Bell, Ban,
  DollarSign, Star, Percent, ExternalLink, ClipboardCheck, UserCheck, Wallet, Megaphone, TrendingDown, Sparkles, LogIn, Users, BellRing
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

  const tabSections = useMemo(() => [
    {
      group: 'Utama', icon: BarChart3,
      tabs: [
        { value: 'overview', icon: BarChart3, label: 'Overview' },
        { value: 'rentals', icon: CalendarDays, label: 'Rentals' },
        { value: 'calendar', icon: CalendarDays, label: 'Kalender' },
        { value: 'activity', icon: Activity, label: 'Activity' },
      ],
    },
    {
      group: 'Tenant', icon: Users,
      tabs: [
        { value: 'renewal', icon: Clock, label: 'Renewal' },
        { value: 'verification', icon: Shield, label: 'KYC' },
        { value: 'screening', icon: UserCheck, label: 'Screening' },
        { value: 'documents', icon: FileText, label: 'Dokumen' },
        { value: 'checkinout', icon: LogIn, label: 'Check-in' },
        { value: 'visitors', icon: Users, label: 'Visitor' },
      ],
    },
    {
      group: 'Keuangan', icon: DollarSign,
      tabs: [
        { value: 'invoices', icon: DollarSign, label: 'Invoice' },
        { value: 'deposits', icon: Wallet, label: 'Deposit' },
        { value: 'expenses', icon: TrendingDown, label: 'Biaya' },
        { value: 'payout', icon: Wallet, label: 'Payout' },
        { value: 'financial', icon: DollarSign, label: 'Keuangan' },
        { value: 'smart-pricing', icon: Sparkles, label: 'Pricing' },
      ],
    },
    {
      group: 'Properti', icon: Building,
      tabs: [
        { value: 'maintenance', icon: Settings, label: 'Maint.' },
        { value: 'inspection', icon: ClipboardCheck, label: 'Inspeksi' },
        { value: 'contracts', icon: FileText, label: 'Kontrak' },
        { value: 'cancellations', icon: Ban, label: 'Batal' },
        { value: 'reviews', icon: Star, label: 'Review' },
      ],
    },
    {
      group: 'Analitik', icon: TrendingUp,
      tabs: [
        { value: 'prop-analytics', icon: BarChart3, label: 'Analitik' },
        { value: 'conversion', icon: Target, label: 'Konversi' },
        { value: 'leads', icon: Users, label: 'Leads' },
        { value: 'tips', icon: Sparkles, label: 'AI Tips' },
        { value: 'forecast', icon: Target, label: 'Forecast' },
        { value: 'insights', icon: TrendingUp, label: 'Insights' },
      ],
    },
    {
      group: 'Komunikasi', icon: Megaphone,
      tabs: [
        { value: 'automation', icon: Zap, label: 'Automasi' },
        { value: 'announcements', icon: Megaphone, label: 'Broadcast' },
        { value: 'notifications', icon: Bell, label: 'Notif' },
        { value: 'reminders', icon: BellRing, label: 'Reminder' },
      ],
    },
  ], []);

  const findGroupForTab = (tabValue: string) => {
    return tabSections.find(s => s.tabs.some(t => t.value === tabValue))?.group || 'Utama';
  };

  const [openGroup, setOpenGroup] = useState<string>(() => findGroupForTab(defaultTab));
  const [perfExpanded, setPerfExpanded] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [aksiExpanded, setAksiExpanded] = useState(false);
  const [propsExpanded, setPropsExpanded] = useState(true);

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
    <div className="space-y-3 sm:space-y-4 md:space-y-5">
      {/* Profile Card with ID */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-3 sm:p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-primary-foreground/30">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-primary-foreground truncate">
                  {profile?.full_name || 'Property Owner'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="text-[9px] sm:text-[10px] px-1.5 py-0.5 h-auto bg-primary-foreground/20 text-primary-foreground border-0 gap-0.5">
                    <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Verified Owner
                  </Badge>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-chart-1 rounded-full animate-pulse"></div>
                    <span className="text-[9px] sm:text-[10px] text-primary-foreground/70">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" className="h-8 w-8 sm:h-9 sm:w-9 p-0" onClick={() => navigate('/dashboard/property-owner')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" className="h-8 sm:h-9 px-3 text-[10px] sm:text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground" onClick={() => navigate('/add-property')}>
                <PlusCircle className="h-3.5 w-3.5 mr-1" /> Tambah
              </Button>
            </div>
          </div>
        </div>
        {/* Owner ID Row */}
        <div className="px-3 sm:px-4 py-2 bg-muted/30 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Owner:</span>
            <span className="text-[10px] sm:text-xs font-medium text-foreground truncate max-w-[160px] sm:max-w-[200px]">
              {profile?.full_name || user?.email || '-'}
            </span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={copyId} title="Copy ID">
              <Copy className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] sm:text-xs text-muted-foreground">Bergabung:</span>
            <span className="text-[10px] sm:text-xs text-foreground font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
            </span>
          </div>
        </div>
      </Card>

      {/* ASTRA Token Wallet — Top Position */}
      <OwnerAstraTokenCard />

      {/* Analytics Overview - Smart Collapsible */}
      <Card className="overflow-hidden">
        <div
          onClick={() => setStatsExpanded(!statsExpanded)}
          className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Building className="h-4 w-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">Ringkasan Properti</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
              <Building className="h-2.5 w-2.5" />{stats.totalProperties}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
              <Activity className="h-2.5 w-2.5" />{stats.activeListings}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
              <Target className="h-2.5 w-2.5" />{stats.pendingApprovals}
            </Badge>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${statsExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <AnimatePresence>
          {statsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3 px-3 pb-3 sm:px-4 sm:pb-4">
                {[
                  { icon: Building, value: stats.totalProperties, label: 'Total', color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: Activity, value: stats.activeListings, label: 'Aktif', color: 'text-chart-1', bg: 'bg-chart-1/10' },
                  { icon: Target, value: stats.pendingApprovals, label: 'Pending', color: 'text-chart-3', bg: 'bg-chart-3/10' },
                ].map((stat, i) => (
                  <div key={i} className="bg-muted/40 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-base sm:text-lg font-bold block leading-none">{stat.value}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Key Performance Metrics - Smart Collapsible */}
      <Card className="overflow-hidden">
        <div
          onClick={() => setPerfExpanded(!perfExpanded)}
          className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">Performa Ringkas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-mono">{activeRate}%</Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-mono">{conversionRate}%</Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
              <Eye className="h-2.5 w-2.5" />{stats.totalViews}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
              <Heart className="h-2.5 w-2.5" />{stats.savedCount}
            </Badge>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${perfExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <AnimatePresence>
          {perfExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-3 px-3 pb-3 sm:px-4 sm:pb-4">
                <div className="bg-muted/40 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Tingkat Aktif</span>
                    <span className="text-xs sm:text-sm font-bold text-chart-1">{activeRate}%</span>
                  </div>
                  <Progress value={activeRate} className="h-1.5" />
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Konversi</span>
                    <span className="text-xs sm:text-sm font-bold text-primary">{conversionRate}%</span>
                  </div>
                  <Progress value={Number(conversionRate)} className="h-1.5" />
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5 sm:p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-chart-5" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Views</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground">{stats.totalViews}</span>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5 sm:p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Disimpan</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground">{stats.savedCount}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* (ASTRA wallet moved to top) */}

      {/* Smart Navigation Links - Collapsible */}
      <Card className="overflow-hidden">
        <div
          onClick={() => setAksiExpanded(!aksiExpanded)}
          className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-chart-3" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">Aksi Cepat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{smartLinks.length} menu</Badge>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${aksiExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <AnimatePresence>
          {aksiExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 px-3 pb-3 sm:px-4 sm:pb-4">
                {smartLinks.map((link, i) => (
                  <div
                    key={i}
                    className="bg-muted/40 rounded-lg p-2.5 sm:p-3 cursor-pointer hover:bg-muted/60 active:scale-[0.97] transition-all"
                    onClick={(e) => { e.stopPropagation(); link.action(); }}
                  >
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center ${link.bg}`}>
                        <link.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${link.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-foreground leading-tight">{link.label}</p>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5">{link.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-3" onValueChange={(val) => setOpenGroup(findGroupForTab(val))}>
        <div className="flex flex-wrap gap-1">
          {tabSections.map((section) => {
            const isOpen = openGroup === section.group;
            const SectionIcon = section.icon;
            return (
              <div key={section.group} className="contents">
                {/* Group header chip */}
                <button
                  onClick={() => setOpenGroup(isOpen ? '' : section.group)}
                  className={`inline-flex items-center gap-1 h-7 sm:h-8 px-2.5 sm:px-3 rounded-md text-[10px] sm:text-xs font-medium transition-all border ${
                    isOpen
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <SectionIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {section.group}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded tabs inline */}
                {isOpen && (
                  <TabsList className="inline-flex h-auto p-0 gap-0.5 bg-transparent">
                    {section.tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="text-[9px] sm:text-[11px] h-6 sm:h-7 gap-1 px-2 sm:px-2.5 min-w-fit whitespace-nowrap bg-accent/50 hover:bg-accent data-[state=active]:bg-chart-1 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md"
                      >
                        <tab.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                )}
              </div>
            );
          })}
        </div>

        {/* Overview Tab — Properties List */}
        <TabsContent value="overview" className="mt-2">
          <Card className="overflow-hidden">
            <div
              onClick={() => setPropsExpanded(!propsExpanded)}
              className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-chart-1" />
                <span className="text-xs sm:text-sm font-semibold text-foreground">Daftar Properti</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{properties.length} properti</Badge>
                <Button variant="link" size="sm" className="h-5 text-[10px] sm:text-xs px-0 text-primary" onClick={(e) => { e.stopPropagation(); navigate('/my-properties'); }}>
                  Semua <ExternalLink className="h-3 w-3 ml-0.5" />
                </Button>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${propsExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
            <AnimatePresence>
              {propsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
                    {properties.length === 0 ? (
                      <div className="text-center py-4">
                        <Building className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-xs font-medium">Belum ada properti</p>
                        <p className="text-[9px] text-muted-foreground mb-2">Tambahkan properti pertama Anda</p>
                        <Button size="sm" className="h-6 text-[9px]" onClick={() => navigate('/add-property')}>
                          <PlusCircle className="h-3 w-3 mr-1" /> Tambah Properti
                        </Button>
                      </div>
                    ) : (
                      properties.slice(0, 5).map((property) => (
                        <div
                          key={property.id}
                          className="bg-muted/40 rounded-lg p-2 sm:p-3 active:scale-[0.99] transition-transform cursor-pointer hover:bg-muted/60"
                          onClick={(e) => { e.stopPropagation(); navigate(`/property/${property.id}`); }}
                        >
                          <div className="flex gap-2.5 sm:gap-3">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                              {property.thumbnail_url || property.images?.[0] ? (
                                <img src={property.thumbnail_url || property.images?.[0]} alt={property.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center"><Building className="h-5 w-5 text-muted-foreground" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5">
                                <h3 className="text-xs sm:text-sm font-medium truncate flex-1">{property.title || 'Untitled'}</h3>
                                <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 h-auto flex-shrink-0">{property.status}</Badge>
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">{property.city}, {property.state}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs sm:text-sm font-semibold text-primary">{formatIDR(property.price)}</span>
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 h-auto">{property.listing_type}</Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground self-center flex-shrink-0" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
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

        <TabsContent value="inspection" className="mt-1.5">
          <OwnerInspectionManagement />
        </TabsContent>

        {/* Screening Tab */}
        <TabsContent value="screening" className="mt-1.5">
          <OwnerTenantScreening />
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits" className="mt-1.5">
          <OwnerDepositManagement />
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="mt-1.5">
          <OwnerLeaseContracts />
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-1.5">
          <OwnerExpenseTracking />
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="mt-1.5">
          <OwnerPaymentAutomation />
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-1.5">
          <OwnerAnnouncementHub />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-1.5">
          <RentalNotificationCenter />
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="mt-1.5">
          <OwnerReminderDashboard />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-2 mt-2">
          {recentActivity.length === 0 ? (
            <Card className="p-4">
              <div className="text-center py-6">
                <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">Belum ada aktivitas</p>
                <p className="text-xs text-muted-foreground">Aktivitas Anda akan muncul di sini</p>
              </div>
            </Card>
          ) : (
            recentActivity.map((activity: any) => (
              <Card key={activity.id} className="p-2.5 sm:p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{activity.activity_type?.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{activity.activity_description}</p>
                  </div>
                  <span className="text-[9px] sm:text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-1.5">
          <OwnerCalendarView />
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="mt-1.5">
          <OwnerFinancialAnalytics />
        </TabsContent>

        {/* Payout Tab */}
        <TabsContent value="payout" className="mt-1.5">
          <OwnerPayoutManagement />
        </TabsContent>

        {/* Smart Pricing Tab */}
        <TabsContent value="smart-pricing" className="mt-1.5">
          <OwnerSmartPricing />
        </TabsContent>

        {/* Cancellations Tab */}
        <TabsContent value="cancellations" className="mt-1.5">
          <OwnerBookingCancellation />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-1.5">
          <OwnerReviewsDashboard />
        </TabsContent>

        {/* Property Analytics Tab */}
        <TabsContent value="prop-analytics" className="mt-1.5">
          <OwnerPropertyAnalytics />
        </TabsContent>

        {/* Conversion Tracking Tab */}
        <TabsContent value="conversion" className="mt-1.5">
          <OwnerConversionTracking />
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="leads" className="mt-1.5">
          <LeadScoringPanel />
        </TabsContent>

        {/* AI Tips Tab */}
        <TabsContent value="tips" className="mt-1.5">
          <ListingTipsPanel />
        </TabsContent>

        {/* Check-in/out Tab */}
        <TabsContent value="checkinout" className="mt-1.5">
          <OwnerCheckInOut />
        </TabsContent>

        {/* Visitor Tracking Tab */}
        <TabsContent value="visitors" className="mt-1.5">
          <OwnerVisitorTracking />
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="mt-1.5">
          <OwnerOccupancyForecast />
        </TabsContent>

        {/* Tenant Documents Tab */}
        <TabsContent value="documents" className="mt-1.5">
          <OwnerTenantDocuments />
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
