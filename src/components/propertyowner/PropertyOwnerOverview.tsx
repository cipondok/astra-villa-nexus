
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Award,
  Crown,
  PlusCircle,
  BarChart3,
  Settings,
  Activity,
  Target
} from "lucide-react";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import UpcomingTasks from "./UpcomingTasks";
import PropertyInsights from "./PropertyInsights";
import DemoPropertyList from "./DemoPropertyList";

const PropertyOwnerOverview = () => {
  const navigate = useNavigate();

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
      {/* Professional Property Owner Header */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-800 text-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
          
          <div className="relative z-10">
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Building className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Property Owner Dashboard</h1>
                    <p className="text-blue-100 text-lg">Kelola properti Anda dan pantau performa listing</p>
                  </div>
                </div>
                
                {/* Owner Status */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-100 text-sm font-medium">Active Owner</span>
                  </div>
                  <div className={`flex items-center gap-2 ${membership.currentLevel.color} px-4 py-2 rounded-full`}>
                    <CurrentIcon className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">{membership.currentLevel.name} Member</span>
                  </div>
                </div>
              </div>
              
              {/* Main Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/add-property')}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Tambah Properti
                </Button>
                <Button 
                  onClick={() => navigate('/properties')}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  <Building className="h-5 w-5 mr-2" />
                  Lihat Semua
                </Button>
              </div>
            </div>
            
            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalProperties}</div>
                    <div className="text-blue-100 text-sm">Total Properti</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.activeListings}</div>
                    <div className="text-blue-100 text-sm">Listing Aktif</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalViews}</div>
                    <div className="text-blue-100 text-sm">Total Views</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                    <div className="text-blue-100 text-sm">Inquiries</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">45M</div>
                    <div className="text-blue-100 text-sm">Pendapatan</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-orange-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                    <div className="text-blue-100 text-sm">Menunggu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Level Card */}
      <Card className="border-l-4 border-l-amber-500 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${membership.currentLevel.color} flex items-center justify-center shadow-lg`}>
                <CurrentIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Level {membership.currentLevel.level}: {membership.currentLevel.name} Owner
                </CardTitle>
                <CardDescription className="text-base">
                  Progress ke {membership.nextLevel.name}: {membership.progress.current}/{membership.progress.required} properti
                </CardDescription>
              </div>
            </div>
            <Badge className={`${membership.currentLevel.color} text-white px-4 py-2 text-sm`}>
              {membership.currentLevel.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Progress ke level berikutnya</span>
                <span className="font-bold">{membership.progress.percentage}%</span>
              </div>
              <Progress value={membership.progress.percentage} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {membership.progress.required - membership.progress.current} properti lagi untuk mencapai level {membership.nextLevel.name}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Benefit Saat Ini</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {membership.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs justify-center py-2">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Tabs */}
      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-muted/50">
          <TabsTrigger value="properties" className="text-sm font-medium">Properti Saya</TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm font-medium">Analytics</TabsTrigger>
          <TabsTrigger value="activity" className="text-sm font-medium">Aktivitas</TabsTrigger>
          <TabsTrigger value="tasks" className="text-sm font-medium">Tugas</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Portfolio Properti</h2>
              <p className="text-muted-foreground">Kelola dan pantau performa listing properti Anda</p>
            </div>
          </div>
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
