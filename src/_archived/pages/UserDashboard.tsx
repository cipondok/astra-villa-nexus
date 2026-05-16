import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import AgentOverview from "@/components/agent/AgentOverview";
import CustomerServiceDashboard from "@/components/dashboard/CustomerServiceDashboard";
import ProfileUpgradeCard from "@/components/ProfileUpgradeCard";
import InvestorPropertiesSection from "@/components/dashboard/InvestorPropertiesSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUserDashboardData } from "@/hooks/useUserDashboardData";
import { useIsInvestor } from "@/hooks/useInvestorProfile";
import { formatDistanceToNow } from "date-fns";
import { OrdersList } from "@/components/orders/OrdersList";
import { TicketsList } from "@/components/support/TicketsList";
import { AffiliatePanel } from "@/components/affiliate/AffiliatePanel";
import { motion } from "framer-motion";
import { 
  Home, 
  Search, 
  Heart, 
  MessageSquare,
  User,
  Bell,
  Settings,
  Calendar,
  Activity,
  ChevronRight,
  Package,
  HelpCircle,
  Share2,
  Building2,
  Sparkles,
  Crown,
  TrendingUp,
  Shield
} from "lucide-react";

const StatCard = ({ icon: Icon, value, label, color, delay }: { icon: any; value: number; label: string; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
  >
    <Card className="p-3 sm:p-4 bg-card/60 backdrop-blur-xl border-border/30 hover:border-amber-500/20 hover:shadow-md hover:shadow-amber-500/5 transition-all group">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-105`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

const QuickAction = ({ icon: Icon, title, desc, color, onClick, delay }: { icon: any; title: string; desc: string; color: string; onClick: () => void; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card 
      className="cursor-pointer bg-card/60 backdrop-blur-xl border-border/30 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5 active:scale-[0.98] transition-all group" 
      onClick={onClick}
    >
      <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">{desc}</CardDescription>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
      </CardHeader>
    </Card>
  </motion.div>
);

const UserDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { stats, savedProperties, recentActivity, isLoading } = useUserDashboardData();
  const { isInvestor, investorType } = useIsInvestor();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-sm sm:text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Render Agent Dashboard for agent users
  if (profile?.role === 'agent') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-14 sm:pt-16 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-4 sm:py-8">
            <AgentOverview />
          </div>
        </div>
      </div>
    );
  }

  // Render Customer Service Dashboard for CS users
  if (profile?.role === 'customer_service') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-14 sm:pt-16 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-4 sm:py-8">
            <CustomerServiceDashboard />
          </div>
        </div>
      </div>
    );
  }

  // Default user dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-14 sm:pt-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6">
          
          {/* Welcome Section - Gold Premium */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-white/80" />
                    <span className="text-white/70 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Dashboard</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white truncate">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
                  </h1>
                  <p className="text-white/70 text-xs sm:text-sm mt-1.5">
                    Manage your properties and track your activity
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] sm:text-xs backdrop-blur-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      {profile?.role?.replace('_', ' ')}
                    </Badge>
                    {isInvestor && (
                      <Badge className="bg-white/20 text-white border-white/30 text-[10px] sm:text-xs backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Investor
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-14 w-14 sm:h-18 sm:w-18 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ml-4 border border-white/20">
                  <User className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatCard icon={Heart} value={stats.savedProperties} label="Saved" color="bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-500" delay={0.1} />
            <StatCard icon={Calendar} value={stats.messages} label="Bookings" color="bg-gradient-to-br from-amber-500/20 to-yellow-400/20 text-amber-600 dark:text-amber-400" delay={0.15} />
            <StatCard icon={Activity} value={recentActivity.length} label="Activities" color="bg-gradient-to-br from-emerald-500/20 to-green-400/20 text-emerald-500" delay={0.2} />
            <StatCard icon={Bell} value={stats.notifications} label="Alerts" color="bg-gradient-to-br from-violet-500/20 to-purple-400/20 text-violet-500" delay={0.25} />
          </div>

          {/* Upgrade Card for General Users */}
          {profile?.role === 'general_user' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ProfileUpgradeCard />
            </motion.div>
          )}

          {/* Dashboard Tabs */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Tabs defaultValue={isInvestor ? "properties" : "overview"} className="space-y-4">
              <TabsList className={`grid w-full h-10 sm:h-11 bg-muted/50 backdrop-blur-sm border border-border/30 ${isInvestor ? 'grid-cols-5' : 'grid-cols-4'}`}>
                {isInvestor && (
                  <TabsTrigger value="properties" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30">
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Properties</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                  <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                  <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Support</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-400/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Investor Properties Tab */}
              {isInvestor && (
                <TabsContent value="properties" className="space-y-4">
                  <InvestorPropertiesSection />
                </TabsContent>
              )}

              <TabsContent value="overview" className="space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <QuickAction icon={Search} title="Browse Properties" desc="Find your dream home" color="bg-gradient-to-br from-amber-500/20 to-yellow-400/20 text-amber-600 dark:text-amber-400" onClick={() => navigate('/dijual')} delay={0.4} />
                  <QuickAction icon={Heart} title={`Saved (${stats.savedProperties})`} desc="View favorites" color="bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-500" onClick={() => {}} delay={0.45} />
                  <QuickAction icon={MessageSquare} title="Messages" desc="Chat with agents" color="bg-gradient-to-br from-blue-500/20 to-cyan-400/20 text-blue-500" onClick={() => {}} delay={0.5} />
                </div>

                {/* Recent Activity */}
                <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                            <Activity className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          Recent Activity
                        </CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs mt-1">Your latest interactions</CardDescription>
                      </div>
                      {recentActivity.length > 0 && (
                        <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                          {recentActivity.length} items
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                      </div>
                    ) : recentActivity.length > 0 ? (
                      <div className="space-y-2">
                        {recentActivity.slice(0, 5).map((activity, idx) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.05 }}
                            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-border/20 bg-muted/30 hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all"
                          >
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500/15 to-yellow-400/15 flex items-center justify-center flex-shrink-0">
                              <Activity className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium truncate text-foreground">
                                {activity.activity_type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {activity.activity_description}
                              </p>
                            </div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground/70 flex-shrink-0">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-400/10 flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="h-6 w-6 text-amber-500/40" />
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">No recent activity</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">
                          Start browsing properties to see activity here
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-4 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white border-0 shadow-sm shadow-amber-500/20" 
                          onClick={() => navigate('/dijual')}
                        >
                          <Search className="h-3.5 w-3.5 mr-1.5" />
                          Browse Properties
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                <OrdersList maxHeight="500px" />
              </TabsContent>

              {/* Support Tab */}
              <TabsContent value="support" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <TicketsList maxHeight="400px" />
                  </div>
                  <div>
                    <AffiliatePanel />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                        <Settings className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      Account Settings
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {[
                          { label: 'Full Name', value: profile?.full_name || 'Not set', icon: User },
                          { label: 'Email', value: profile?.email || 'Not set', icon: MessageSquare },
                          { label: 'Role', value: profile?.role?.replace('_', ' ') || 'Not set', icon: Crown },
                          { label: 'Verification', value: profile?.verification_status || 'pending', icon: Shield, isBadge: true },
                        ].map((field, idx) => (
                          <motion.div
                            key={field.label}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            className="p-3 rounded-xl border border-border/20 bg-muted/30 hover:border-amber-500/20 transition-all"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <field.icon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">{field.label}</label>
                            </div>
                            {field.isBadge ? (
                              <Badge 
                                variant={field.value === 'verified' ? 'default' : 'secondary'}
                                className={`text-[10px] sm:text-xs ${field.value === 'verified' ? 'bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-700 dark:text-amber-400 border-amber-500/30' : ''}`}
                              >
                                {field.value}
                              </Badge>
                            ) : (
                              <p className="text-xs sm:text-sm font-medium truncate capitalize text-foreground">{field.value}</p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      <Button 
                        onClick={() => navigate('/profile')} 
                        className="w-full sm:w-auto h-9 text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white border-0 shadow-sm shadow-amber-500/20"
                      >
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
