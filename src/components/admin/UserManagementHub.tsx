
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, UserCheck, UserX, Shield, Crown, TrendingUp, 
  Activity, Clock, BarChart3, AlertTriangle 
} from "lucide-react";
import { lazy, Suspense } from "react";

const EnhancedUserManagement = lazy(() => import("./EnhancedUserManagement"));
const UserLevelManagement = lazy(() => import("./UserLevelManagement"));
const UserUpgradeApplications = lazy(() => import("./UserUpgradeApplications"));
const VerificationManagement = lazy(() => import("./VerificationManagement"));

interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  suspendedUsers: number;
  newUsers30d: number;
  newUsers7d: number;
  roleAssignments: number;
  activities24h: number;
  roleBreakdown: Array<{ role: string; count: number }>;
  recentSignups: Array<{ id: string; full_name: string; email: string; created_at: string }>;
}

const UserManagementHub = ({ onNavigate }: { onNavigate?: (section: string) => void }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-management-stats'],
    queryFn: async (): Promise<UserStats> => {
      const [
        { count: totalUsers },
        { count: verifiedUsers },
        { count: suspendedUsers },
        { count: newUsers30d },
        { count: newUsers7d },
        { data: roleData },
        { count: activities24h },
        { data: recentSignups }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_suspended', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_roles').select('role'),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('profiles').select('id, full_name, email, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      // Count roles
      const roleCounts: Record<string, number> = {};
      (roleData || []).forEach((r: any) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      const roleBreakdown = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

      return {
        totalUsers: totalUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        suspendedUsers: suspendedUsers || 0,
        newUsers30d: newUsers30d || 0,
        newUsers7d: newUsers7d || 0,
        roleAssignments: roleData?.length || 0,
        activities24h: activities24h || 0,
        roleBreakdown,
        recentSignups: (recentSignups || []) as any[],
      };
    },
    staleTime: 30000,
  });

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { title: "Verified", value: stats?.verifiedUsers ?? 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
    { title: "Suspended", value: stats?.suspendedUsers ?? 0, icon: UserX, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
    { title: "New (30d)", value: stats?.newUsers30d ?? 0, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
    { title: "New (7d)", value: stats?.newUsers7d ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { title: "Activity (24h)", value: stats?.activities24h ?? 0, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  ];

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    agent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    property_owner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    vendor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    general_user: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    customer_service: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Management Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Overview, user accounts, levels & verification</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="levels" className="text-xs gap-1.5">
            <Crown className="h-3.5 w-3.5" /> Levels
          </TabsTrigger>
          <TabsTrigger value="upgrades" className="text-xs gap-1.5">
            <UserCheck className="h-3.5 w-3.5" /> Upgrades
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-xs gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Verification
          </TabsTrigger>
        </TabsList>

        {/* Overview Dashboard */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((stat) => (
              <Card key={stat.title} className="border shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-md ${stat.bg}`}>
                      <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{stat.title}</span>
                  </div>
                  <p className="text-xl font-bold">
                    {isLoading ? "—" : stat.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Distribution */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : stats?.roleBreakdown.length ? (
                  <div className="space-y-2">
                    {stats.roleBreakdown.map(({ role, count }) => (
                      <div key={role} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                        <Badge className={`text-[10px] ${roleColors[role] || roleColors.general_user}`}>
                          {role.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No role data</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Signups */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : stats?.recentSignups.length ? (
                  <div className="space-y-2">
                    {stats.recentSignups.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{user.full_name || 'No name'}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No recent signups</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Manage Users", tab: "users", icon: Users },
                  { label: "User Levels", tab: "levels", icon: Crown },
                  { label: "Upgrade Apps", tab: "upgrades", icon: UserCheck },
                  { label: "Verification", tab: "verification", icon: Shield },
                ].map((action) => (
                  <button
                    key={action.tab}
                    onClick={() => setActiveTab(action.tab)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <action.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-pages */}
        <TabsContent value="users" className="mt-4">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
            <EnhancedUserManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="levels" className="mt-4">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
            <UserLevelManagement onNavigate={onNavigate} />
          </Suspense>
        </TabsContent>

        <TabsContent value="upgrades" className="mt-4">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
            <UserUpgradeApplications />
          </Suspense>
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
            <VerificationManagement />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementHub;
