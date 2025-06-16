
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Award,
  Crown
} from "lucide-react";
import QuickActions from "./QuickActions";
import MembershipLevel from "./MembershipLevel";
import RecentActivity from "./RecentActivity";
import UpcomingTasks from "./UpcomingTasks";
import PropertyInsights from "./PropertyInsights";
import DemoPropertyList from "./DemoPropertyList";

const PropertyOwnerOverview = () => {
  // Sample data for demonstration
  const stats = {
    totalProperties: 3,
    activeListings: 2,
    totalViews: 156,
    totalInquiries: 8,
    monthlyRevenue: 45000000,
    pendingApprovals: 1
  };

  const membership = {
    currentLevel: {
      name: "Bronze",
      level: 1,
      icon: Award,
      color: "bg-gradient-to-r from-amber-600 to-orange-600",
      textColor: "text-amber-600"
    },
    nextLevel: {
      name: "Silver", 
      level: 2,
      icon: Crown
    },
    progress: {
      current: 3,
      required: 5,
      percentage: 60
    },
    benefits: [
      "Listing hingga 5 properti",
      "Dukungan dasar",
      "Analytics dasar",
      "1 Featured listing/bulan"
    ]
  };

  const CurrentIcon = membership.currentLevel.icon;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Property Owner</h1>
            <p className="text-blue-100 mt-2">Kelola properti Anda dan pantau performa listing</p>
          </div>
          <Building className="h-8 w-8" />
        </div>
      </div>

      {/* Membership Level Card */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${membership.currentLevel.color} flex items-center justify-center`}>
                <CurrentIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Level {membership.currentLevel.level}: {membership.currentLevel.name} Owner
                </CardTitle>
                <CardDescription>
                  Progress ke {membership.nextLevel.name}: {membership.progress.current}/{membership.progress.required} properti
                </CardDescription>
              </div>
            </div>
            <Badge className={membership.currentLevel.color} variant="secondary">
              {membership.currentLevel.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress ke level berikutnya</span>
                <span>{membership.progress.percentage}%</span>
              </div>
              <Progress value={membership.progress.percentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {membership.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properti</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Semua properti Anda</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listing Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">Sedang dipasarkan</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Dilihat bulan ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">Pertanyaan masuk</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45M</div>
            <p className="text-xs text-muted-foreground">IDR bulan ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Persetujuan admin</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Tabs */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="properties">Properti Saya</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          <TabsTrigger value="tasks">Tugas</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <DemoPropertyList />
        </TabsContent>

        <TabsContent value="analytics">
          <PropertyInsights />
        </TabsContent>

        <TabsContent value="activity">
          <RecentActivity />
        </TabsContent>

        <TabsContent value="tasks">
          <UpcomingTasks />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyOwnerOverview;
